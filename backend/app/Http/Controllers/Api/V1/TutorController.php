<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tutor\UpdateTutorProfileRequest;
use App\Http\Resources\TutorProfileResource;
use App\Http\Resources\UserResource;
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

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'profile' => new TutorProfileResource($profile),
                'stats' => [
                    'total_sessions' => $profile->total_sessions,
                    'avg_rating' => (float) $profile->avg_rating,
                    'verification_status' => $profile->verification_status,
                ],
            ],
        ]);
    }
}
