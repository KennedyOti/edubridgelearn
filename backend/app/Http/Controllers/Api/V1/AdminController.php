<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ContributorProfile;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function getDashboardStats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'active_students' => User::where('role', 'student')->where('status', 'active')->count(),
                'pending_tutors' => TutorProfile::where('verification_status', 'pending')->count(),
                'pending_contributors' => ContributorProfile::where('verification_status', 'pending')->count(),
                'active_tutors' => User::where('role', 'tutor')->where('status', 'active')->count(),
                'suspended_users' => User::where('status', 'suspended')->count(),
                'total_tutors' => User::where('role', 'tutor')->count(),
                'total_contributors' => User::where('role', 'contributor')->count(),
            ],
        ]);
    }

    public function listUsers(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%");
            });
        }

        $perPage = min((int) ($request->per_page ?? 20), 100);
        $users = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function approveTutor(Request $request, string $userId): JsonResponse
    {
        $user = User::where('uuid', $userId)->where('role', 'tutor')->firstOrFail();
        $profile = $user->tutorProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Tutor profile not found.']],
            ], 404);
        }

        $profile->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
            'next_reverification_at' => now()->addYear(),
            'rejection_reason' => null,
        ]);

        $user->update(['status' => 'active']);

        return response()->json([
            'data' => new UserResource($user->fresh()->load('tutorProfile')),
            'meta' => ['message' => 'Tutor approved successfully.'],
        ]);
    }

    public function rejectTutor(Request $request, string $userId): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $user = User::where('uuid', $userId)->where('role', 'tutor')->firstOrFail();
        $profile = $user->tutorProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Tutor profile not found.']],
            ], 404);
        }

        $profile->update([
            'verification_status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return response()->json([
            'data' => new UserResource($user->fresh()->load('tutorProfile')),
            'meta' => ['message' => 'Tutor application rejected.'],
        ]);
    }

    public function approveContributor(Request $request, string $userId): JsonResponse
    {
        $user = User::where('uuid', $userId)->where('role', 'contributor')->firstOrFail();
        $profile = $user->contributorProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Contributor profile not found.']],
            ], 404);
        }

        $profile->update(['verification_status' => 'approved']);
        $user->update(['status' => 'active']);

        return response()->json([
            'data' => new UserResource($user->fresh()->load('contributorProfile')),
            'meta' => ['message' => 'Contributor approved successfully.'],
        ]);
    }

    public function rejectContributor(Request $request, string $userId): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $user = User::where('uuid', $userId)->where('role', 'contributor')->firstOrFail();
        $profile = $user->contributorProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Contributor profile not found.']],
            ], 404);
        }

        $profile->update(['verification_status' => 'rejected']);

        return response()->json([
            'data' => new UserResource($user->fresh()->load('contributorProfile')),
            'meta' => ['message' => 'Contributor application rejected.'],
        ]);
    }

    public function updateUserStatus(Request $request, string $userId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,suspended,deactivated',
        ]);

        $user = User::where('uuid', $userId)->firstOrFail();

        // Prevent modifying other admins/super_admins unless you are super_admin
        if (in_array($user->role, ['admin', 'super_admin']) && $request->user()->role !== 'super_admin') {
            return response()->json([
                'errors' => [['message' => 'You cannot modify admin accounts.']],
            ], 403);
        }

        $user->update(['status' => $request->status]);

        return response()->json([
            'data' => new UserResource($user->fresh()),
            'meta' => ['message' => 'User status updated.'],
        ]);
    }

    public function createAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|regex:/[a-z]/|regex:/[A-Z]/|regex:/[0-9]/',
            'role' => 'required|in:admin,moderator',
        ]);

        $newAdmin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'data' => new UserResource($newAdmin),
            'meta' => ['message' => ucfirst($request->role) . ' account created successfully.'],
        ], 201);
    }

    public function getPendingApprovals(): JsonResponse
    {
        $pendingTutors = User::where('role', 'tutor')
            ->where('status', 'pending_approval')
            ->with('tutorProfile')
            ->latest()
            ->get();

        $pendingContributors = User::where('role', 'contributor')
            ->where('status', 'pending_approval')
            ->with('contributorProfile')
            ->latest()
            ->get();

        return response()->json([
            'data' => [
                'tutors' => UserResource::collection($pendingTutors),
                'contributors' => UserResource::collection($pendingContributors),
            ],
        ]);
    }
}
