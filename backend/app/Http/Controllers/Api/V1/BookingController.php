<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SessionNote;
use App\Models\TutorProfile;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Search available tutors with filters.
     * GET /api/v1/tutors/search
     */
    public function searchTutors(Request $request): JsonResponse
    {
        $request->validate([
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'education_level_id' => 'nullable|integer|exists:education_levels,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric',
            'min_rating' => 'nullable|numeric|min:0|max:5',
            'language' => 'nullable|string',
            'currency' => 'nullable|string|size:3',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = User::where('role', 'tutor')
            ->where('status', 'active')
            ->whereHas('tutorProfile', fn($q) => $q->where('verification_status', 'approved'))
            ->with(['tutorProfile', 'tutorProfile.taughtSubjects']);

        if ($request->subject_id) {
            $query->whereHas('tutorProfile.taughtSubjects', fn($q) => $q->where('subjects.id', $request->subject_id)->where('tutor_subjects.is_active', true));
        }

        if ($request->min_rating) {
            $query->whereHas('tutorProfile', fn($q) => $q->where('avg_rating', '>=', $request->min_rating));
        }

        if ($request->min_price !== null || $request->max_price !== null) {
            $query->whereHas('tutorProfile', function ($q) use ($request) {
                if ($request->min_price !== null) {
                    $q->where('hourly_rate', '>=', $request->min_price);
                }
                if ($request->max_price !== null) {
                    $q->where('hourly_rate', '<=', $request->max_price);
                }
            });
        }

        $tutors = $query->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => $tutors->map(fn($tutor) => [
                'id' => $tutor->uuid,
                'name' => $tutor->name,
                'avatar_url' => $tutor->avatar_url,
                'country' => $tutor->country,
                'profile' => [
                    'bio' => $tutor->tutorProfile->bio,
                    'experience_years' => $tutor->tutorProfile->experience_years,
                    'hourly_rate' => $tutor->tutorProfile->hourly_rate,
                    'rate_currency' => $tutor->tutorProfile->rate_currency,
                    'avg_rating' => $tutor->tutorProfile->avg_rating,
                    'total_sessions' => $tutor->tutorProfile->total_sessions,
                    'subjects' => $tutor->tutorProfile->taughtSubjects->map(fn($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                    ]),
                ],
            ]),
            'meta' => [
                'total' => $tutors->total(),
                'per_page' => $tutors->perPage(),
                'current_page' => $tutors->currentPage(),
                'last_page' => $tutors->lastPage(),
            ],
        ]);
    }

    /**
     * Get tutor public profile with available slots.
     * GET /api/v1/tutors/{tutorUuid}/profile
     */
    public function getTutorPublicProfile(string $tutorUuid): JsonResponse
    {
        $tutor = User::where('uuid', $tutorUuid)
            ->where('role', 'tutor')
            ->where('status', 'active')
            ->with(['tutorProfile.taughtSubjects.educationLevel', 'tutorProfile.availabilitySlots', 'tutorProfile.qualificationRecords'])
            ->firstOrFail();

        if (!$tutor->tutorProfile || !$tutor->tutorProfile->isApproved()) {
            return response()->json(['errors' => [['message' => 'Tutor not found.']]], 404);
        }

        return response()->json([
            'data' => [
                'id' => $tutor->uuid,
                'name' => $tutor->name,
                'avatar_url' => $tutor->avatar_url,
                'country' => $tutor->country,
                'timezone' => $tutor->timezone,
                'profile' => [
                    'bio' => $tutor->tutorProfile->bio,
                    'experience_years' => $tutor->tutorProfile->experience_years,
                    'teaching_methodology' => $tutor->tutorProfile->teaching_methodology,
                    'intro_video_url' => $tutor->tutorProfile->intro_video_url,
                    'hourly_rate' => $tutor->tutorProfile->hourly_rate,
                    'rate_currency' => $tutor->tutorProfile->rate_currency,
                    'avg_rating' => $tutor->tutorProfile->avg_rating,
                    'total_sessions' => $tutor->tutorProfile->total_sessions,
                    'verified_at' => $tutor->tutorProfile->verified_at,
                    'qualifications' => $tutor->tutorProfile->qualificationRecords->map(fn($q) => [
                        'title' => $q->title,
                        'institution' => $q->institution,
                        'year' => $q->year,
                        'is_verified' => $q->is_verified,
                    ]),
                    'subjects' => $tutor->tutorProfile->taughtSubjects->map(fn($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'education_level' => $s->educationLevel->name ?? null,
                    ]),
                    'availability' => $tutor->tutorProfile->availabilitySlots->map(fn($a) => [
                        'day' => $a->day_of_week,
                        'day_name' => $a->day_name,
                        'start_time' => $a->start_time,
                        'end_time' => $a->end_time,
                        'timezone' => $a->timezone,
                    ]),
                ],
            ],
        ]);
    }

    /**
     * Create a booking (student books a tutor slot).
     * POST /api/v1/bookings
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'tutor_uuid' => 'required|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|in:30,45,60,90,120',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'topic_id' => 'nullable|integer|exists:topics,id',
            'student_notes' => 'nullable|string|max:1000',
        ]);

        $student = $request->user();

        $tutor = User::where('uuid', $request->tutor_uuid)
            ->where('role', 'tutor')
            ->where('status', 'active')
            ->with('tutorProfile')
            ->firstOrFail();

        if (!$tutor->tutorProfile?->isApproved()) {
            return response()->json(['errors' => [['message' => 'Tutor is not available for booking.']]], 422);
        }

        // Check for scheduling conflicts
        $scheduledAt = \Carbon\Carbon::parse($request->scheduled_at);
        $endsAt = $scheduledAt->copy()->addMinutes($request->duration_minutes);

        $conflict = Booking::where('tutor_id', $tutor->id)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->where('scheduled_at', '<', $endsAt)
            ->where(DB::raw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE)'), '>', $scheduledAt)
            ->exists();

        if ($conflict) {
            return response()->json(['errors' => [['message' => 'This time slot is no longer available.']]], 409);
        }

        $hourlyRate = $tutor->tutorProfile->hourly_rate ?? 0;
        $currency = $tutor->tutorProfile->rate_currency ?? 'USD';
        $priceInCents = (int) round($hourlyRate * ($request->duration_minutes / 60) * 100);

        $booking = DB::transaction(function () use ($request, $student, $tutor, $scheduledAt, $priceInCents, $currency) {
            return Booking::create([
                'student_id' => $student->id,
                'tutor_id' => $tutor->id,
                'subject_id' => $request->subject_id,
                'topic_id' => $request->topic_id,
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => $request->duration_minutes,
                'status' => 'pending',
                'price' => $priceInCents,
                'currency' => $currency,
                'student_notes' => $request->student_notes,
                'meeting_platform' => 'jitsi',
            ]);
        });

        return response()->json([
            'data' => $this->formatBooking($booking->load(['tutor', 'student', 'subject', 'topic'])),
            'meta' => ['message' => 'Booking created. Proceed to payment to confirm.'],
        ], 201);
    }

    /**
     * Confirm booking after payment.
     * POST /api/v1/bookings/{uuid}/confirm
     */
    public function confirm(Request $request, string $uuid): JsonResponse
    {
        $booking = Booking::where('uuid', $uuid)->firstOrFail();

        if ($booking->student_id !== $request->user()->id) {
            return response()->json(['errors' => [['message' => 'Unauthorized.']]], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['errors' => [['message' => 'Booking cannot be confirmed in its current state.']]], 422);
        }

        $meetingRoom = 'edubridge-' . Str::random(12);

        $booking->update([
            'status' => 'confirmed',
            'meeting_url' => "https://meet.jit.si/{$meetingRoom}",
        ]);

        return response()->json([
            'data' => $this->formatBooking($booking->fresh()->load(['tutor', 'student', 'subject'])),
            'meta' => ['message' => 'Booking confirmed.'],
        ]);
    }

    /**
     * Cancel a booking.
     * POST /api/v1/bookings/{uuid}/cancel
     */
    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $user = $request->user();
        $booking = Booking::where('uuid', $uuid)->firstOrFail();

        $isStudent = $booking->student_id === $user->id;
        $isTutor = $booking->tutor_id === $user->id;
        $isAdmin = $user->isAdmin();

        if (!$isStudent && !$isTutor && !$isAdmin) {
            return response()->json(['errors' => [['message' => 'Unauthorized.']]], 403);
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json(['errors' => [['message' => 'This booking cannot be cancelled.']]], 422);
        }

        $cancelledBy = $isStudent ? 'student' : ($isTutor ? 'tutor' : 'admin');

        $booking->update([
            'status' => 'cancelled',
            'cancelled_by' => $cancelledBy,
            'cancellation_reason' => $request->reason,
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'data' => $this->formatBooking($booking->fresh()),
            'meta' => ['message' => 'Booking cancelled.'],
        ]);
    }

    /**
     * Tutor marks session as completed.
     * POST /api/v1/bookings/{uuid}/complete
     */
    public function complete(Request $request, string $uuid): JsonResponse
    {
        $tutor = $request->user();
        $booking = Booking::where('uuid', $uuid)->where('tutor_id', $tutor->id)->firstOrFail();

        if ($booking->status !== 'confirmed' && $booking->status !== 'in_progress') {
            return response()->json(['errors' => [['message' => 'Session is not in a completable state.']]], 422);
        }

        DB::transaction(function () use ($booking, $tutor) {
            $booking->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Increment tutor total_sessions
            $tutor->tutorProfile()->increment('total_sessions');

            // Credit tutor wallet (minus platform commission of 15%)
            $commissionRate = 0.15;
            $tutorEarnings = (int) round($booking->price * (1 - $commissionRate));

            $wallet = Wallet::firstOrCreate(
                ['user_id' => $tutor->id],
                ['currency' => $booking->currency, 'balance' => 0, 'pending_balance' => 0]
            );

            $wallet->increment('balance', $tutorEarnings);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $tutorEarnings,
                'balance_after' => $wallet->fresh()->balance,
                'currency' => $booking->currency,
                'description' => "Session earnings for booking #{$booking->uuid}",
                'reference_type' => Booking::class,
                'reference_id' => $booking->id,
                'commission_rate' => '15%',
            ]);

            $booking->update(['tutor_paid' => true]);
        });

        return response()->json([
            'data' => $this->formatBooking($booking->fresh()),
            'meta' => ['message' => 'Session marked as completed. Earnings credited to wallet.'],
        ]);
    }

    /**
     * Student rates and reviews a completed session.
     * POST /api/v1/bookings/{uuid}/review
     */
    public function review(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        $student = $request->user();
        $booking = Booking::where('uuid', $uuid)->where('student_id', $student->id)->firstOrFail();

        if ($booking->status !== 'completed') {
            return response()->json(['errors' => [['message' => 'You can only review completed sessions.']]], 422);
        }

        if ($booking->reviewed_at) {
            return response()->json(['errors' => [['message' => 'You have already reviewed this session.']]], 422);
        }

        DB::transaction(function () use ($booking, $request) {
            $booking->update([
                'rating' => $request->rating,
                'review_text' => $request->review_text,
                'reviewed_at' => now(),
            ]);

            // Recalculate tutor avg rating
            $tutorProfile = $booking->tutor->tutorProfile;
            $avgRating = Booking::where('tutor_id', $booking->tutor_id)
                ->where('status', 'completed')
                ->whereNotNull('rating')
                ->avg('rating');

            $tutorProfile->update(['avg_rating' => round($avgRating, 2)]);
        });

        return response()->json([
            'meta' => ['message' => 'Review submitted successfully.'],
        ]);
    }

    /**
     * Tutor adds post-session notes.
     * POST /api/v1/bookings/{uuid}/notes
     */
    public function addNotes(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'notes' => 'required|string|max:5000',
            'homework' => 'nullable|string|max:2000',
            'recommendations' => 'nullable|string|max:2000',
        ]);

        $tutor = $request->user();
        $booking = Booking::where('uuid', $uuid)->where('tutor_id', $tutor->id)->firstOrFail();

        if ($booking->status !== 'completed') {
            return response()->json(['errors' => [['message' => 'Notes can only be added to completed sessions.']]], 422);
        }

        $note = SessionNote::updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'tutor_id' => $tutor->id,
                'notes' => $request->notes,
                'homework' => $request->homework,
                'recommendations' => $request->recommendations,
            ]
        );

        return response()->json([
            'data' => $note,
            'meta' => ['message' => 'Session notes saved.'],
        ]);
    }

    /**
     * List student's bookings.
     * GET /api/v1/students/bookings
     */
    public function studentBookings(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'nullable|in:pending,confirmed,completed,cancelled',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = Booking::where('student_id', $request->user()->id)
            ->with(['tutor', 'subject', 'topic', 'sessionNote']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest('scheduled_at')->paginate($request->per_page ?? 10);

        return response()->json([
            'data' => $bookings->map(fn($b) => $this->formatBooking($b)),
            'meta' => [
                'total' => $bookings->total(),
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
            ],
        ]);
    }

    /**
     * List tutor's bookings.
     * GET /api/v1/tutors/bookings
     */
    public function tutorBookings(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'nullable|in:pending,confirmed,completed,cancelled',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = Booking::where('tutor_id', $request->user()->id)
            ->with(['student', 'subject', 'topic']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest('scheduled_at')->paginate($request->per_page ?? 10);

        return response()->json([
            'data' => $bookings->map(fn($b) => $this->formatBooking($b)),
            'meta' => [
                'total' => $bookings->total(),
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
            ],
        ]);
    }

    /**
     * Get a single booking detail.
     * GET /api/v1/bookings/{uuid}
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $booking = Booking::where('uuid', $uuid)
            ->with(['student', 'tutor', 'subject', 'topic', 'sessionNote', 'recording', 'payment'])
            ->firstOrFail();

        $canView = $booking->student_id === $user->id
            || $booking->tutor_id === $user->id
            || $user->isAdmin();

        if (!$canView) {
            return response()->json(['errors' => [['message' => 'Unauthorized.']]], 403);
        }

        return response()->json([
            'data' => $this->formatBooking($booking, true),
        ]);
    }

    private function formatBooking(Booking $booking, bool $detailed = false): array
    {
        $data = [
            'id' => $booking->uuid,
            'status' => $booking->status,
            'scheduled_at' => $booking->scheduled_at,
            'duration_minutes' => $booking->duration_minutes,
            'price' => $booking->price / 100,
            'currency' => $booking->currency,
            'meeting_url' => $booking->meeting_url,
            'meeting_platform' => $booking->meeting_platform,
            'rating' => $booking->rating,
            'review_text' => $booking->review_text,
            'reviewed_at' => $booking->reviewed_at,
            'created_at' => $booking->created_at,
        ];

        if ($booking->relationLoaded('student')) {
            $data['student'] = [
                'id' => $booking->student->uuid,
                'name' => $booking->student->name,
                'avatar_url' => $booking->student->avatar_url,
            ];
        }

        if ($booking->relationLoaded('tutor')) {
            $data['tutor'] = [
                'id' => $booking->tutor->uuid,
                'name' => $booking->tutor->name,
                'avatar_url' => $booking->tutor->avatar_url,
            ];
        }

        if ($booking->relationLoaded('subject') && $booking->subject) {
            $data['subject'] = ['id' => $booking->subject->id, 'name' => $booking->subject->name];
        }

        if ($detailed && $booking->relationLoaded('sessionNote') && $booking->sessionNote) {
            $data['session_note'] = [
                'notes' => $booking->sessionNote->notes,
                'homework' => $booking->sessionNote->homework,
                'recommendations' => $booking->sessionNote->recommendations,
            ];
        }

        return $data;
    }
}
