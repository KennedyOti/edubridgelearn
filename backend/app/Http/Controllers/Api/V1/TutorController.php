<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tutor\UpdateTutorProfileRequest;
use App\Http\Resources\TutorProfileResource;
use App\Http\Resources\UserResource;
use App\Models\Booking;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TutorController extends Controller
{
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => new TutorProfileResource($user->tutorProfile),
        ]);
    }

    public function updateProfile(UpdateTutorProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->tutorProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Tutor profile not found.']],
            ], 404);
        }

        $profile->update($request->validated());

        return response()->json([
            'data' => new TutorProfileResource($profile->fresh()),
            'meta' => ['message' => 'Tutor profile updated.'],
        ]);
    }

    public function submitForReview(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->tutorProfile;

        // Validate that required fields are filled
        $missing = [];
        if (!$profile->bio) $missing[] = 'bio';
        if (!$profile->qualifications) $missing[] = 'qualifications';
        if (!$profile->subjects) $missing[] = 'subjects';
        if (!$profile->hourly_rate) $missing[] = 'hourly_rate';

        if (!empty($missing)) {
            return response()->json([
                'errors' => [['message' => 'Please complete required fields: ' . implode(', ', $missing)]],
            ], 422);
        }

        $profile->update(['verification_status' => 'pending']);

        return response()->json([
            'data' => new TutorProfileResource($profile->fresh()),
            'meta' => ['message' => 'Profile submitted for review.'],
        ]);
    }

    public function getDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->tutorProfile;
        $tutorId = $user->id;

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonthNoOverflow()->endOfMonth();

        // ── Headline stats ────────────────────────────────────────────────
        $totalSessions = Booking::where('tutor_id', $tutorId)
            ->where('status', 'completed')
            ->count();

        $sessionsThisMonth = Booking::where('tutor_id', $tutorId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $startOfMonth)
            ->count();

        // Active students = distinct students with a completed/confirmed booking
        $activeStudents = Booking::where('tutor_id', $tutorId)
            ->whereIn('status', ['confirmed', 'in_progress', 'completed'])
            ->distinct('student_id')
            ->count('student_id');

        $newStudentsThisMonth = Booking::where('tutor_id', $tutorId)
            ->whereIn('status', ['confirmed', 'in_progress', 'completed'])
            ->where('created_at', '>=', $startOfMonth)
            ->distinct('student_id')
            ->count('student_id');

        // ── Earnings (from wallet transactions, stored in minor units) ─────
        $wallet = Wallet::where('user_id', $tutorId)->first();
        $currency = $wallet->currency ?? ($profile->rate_currency ?? 'USD');

        $earningsThisMonth = 0;
        $earningsLastMonth = 0;
        $monthlyEarnings = array_fill(0, 12, 0.0);

        if ($wallet) {
            $earningsThisMonth = (int) WalletTransaction::where('wallet_id', $wallet->id)
                ->where('type', 'credit')
                ->where('created_at', '>=', $startOfMonth)
                ->sum('amount');

            $earningsLastMonth = (int) WalletTransaction::where('wallet_id', $wallet->id)
                ->where('type', 'credit')
                ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
                ->sum('amount');

            // 12-month earnings trend (Jan..Dec of current year)
            $rows = WalletTransaction::where('wallet_id', $wallet->id)
                ->where('type', 'credit')
                ->whereYear('created_at', $now->year)
                ->selectRaw('MONTH(created_at) as m, SUM(amount) as total')
                ->groupBy('m')
                ->pluck('total', 'm');

            foreach ($rows as $m => $total) {
                $monthlyEarnings[$m - 1] = round($total / 100, 2);
            }
        }

        $earningsChange = null;
        if ($earningsLastMonth > 0) {
            $earningsChange = round((($earningsThisMonth - $earningsLastMonth) / $earningsLastMonth) * 100);
        }

        // ── Weekly sessions chart (Mon..Sun of current week) ───────────────
        $startOfWeek = $now->copy()->startOfWeek(Carbon::MONDAY);
        $weeklyRows = Booking::where('tutor_id', $tutorId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $startOfWeek)
            ->selectRaw('DAYOFWEEK(completed_at) as dow, COUNT(*) as total')
            ->groupBy('dow')
            ->pluck('total', 'dow');

        // DAYOFWEEK: 1=Sun..7=Sat. Reorder to Mon..Sun.
        $dowOrder = [2, 3, 4, 5, 6, 7, 1];
        $weeklySessions = array_map(fn($d) => (int) ($weeklyRows[$d] ?? 0), $dowOrder);

        // ── Recent activity ────────────────────────────────────────────────
        $recentActivity = Booking::where('tutor_id', $tutorId)
            ->whereIn('status', ['completed', 'confirmed', 'cancelled'])
            ->with('student')
            ->latest('updated_at')
            ->limit(6)
            ->get()
            ->map(function ($b) {
                $name = $b->student->name ?? 'A student';
                [$label, $color] = match ($b->status) {
                    'completed' => ["Completed a session with {$name}", 'bg-success'],
                    'confirmed' => ["New session booked by {$name}", 'bg-primary'],
                    'cancelled' => ["Session with {$name} was cancelled", 'bg-error'],
                    default => ["Session update with {$name}", 'bg-muted-foreground'],
                };

                return [
                    'label' => $label,
                    'time' => $b->updated_at->diffForHumans(),
                    'color' => $color,
                ];
            });

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'profile' => new TutorProfileResource($profile),
                'stats' => [
                    'total_sessions' => $totalSessions,
                    'sessions_this_month' => $sessionsThisMonth,
                    'active_students' => $activeStudents,
                    'new_students_this_month' => $newStudentsThisMonth,
                    'earnings_this_month' => round($earningsThisMonth / 100, 2),
                    'earnings_change_pct' => $earningsChange,
                    'currency' => $currency,
                    'avg_rating' => (float) $profile->avg_rating,
                    'verification_status' => $profile->verification_status,
                ],
                'charts' => [
                    'weekly_sessions' => $weeklySessions,
                    'monthly_earnings' => $monthlyEarnings,
                ],
                'recent_activity' => $recentActivity,
            ],
        ]);
    }
}
