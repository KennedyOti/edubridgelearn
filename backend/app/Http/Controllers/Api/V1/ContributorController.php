<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contributor\UpdateContributorProfileRequest;
use App\Http\Resources\ContributorProfileResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContributorController extends Controller
{
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => new ContributorProfileResource($user->contributorProfile),
        ]);
    }

    public function updateProfile(UpdateContributorProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->contributorProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Contributor profile not found.']],
            ], 404);
        }

        $profile->update($request->validated());

        return response()->json([
            'data' => new ContributorProfileResource($profile->fresh()),
            'meta' => ['message' => 'Contributor profile updated.'],
        ]);
    }

    public function submitForReview(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->contributorProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Contributor profile not found.']],
            ], 404);
        }

        $missing = [];
        if (!$profile->bio) $missing[] = 'bio';
        if (!$profile->expertise_areas) $missing[] = 'expertise_areas';

        if (!empty($missing)) {
            return response()->json([
                'errors' => [['message' => 'Please complete required fields: ' . implode(', ', $missing)]],
            ], 422);
        }

        $profile->update(['verification_status' => 'pending']);

        return response()->json([
            'data' => new ContributorProfileResource($profile->fresh()),
            'meta' => ['message' => 'Profile submitted for review.'],
        ]);
    }

    public function getDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->contributorProfile;

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'profile' => new ContributorProfileResource($profile),
                'stats' => [
                    'total_resources' => $profile->total_resources ?? 0,
                    'verification_status' => $profile->verification_status,
                ],
            ],
        ]);
    }
}
