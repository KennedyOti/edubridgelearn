<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\LearningGoal;
use App\Models\School;
use Illuminate\Http\JsonResponse;

class OnboardingOptionController extends Controller
{
    /**
     * Active countries for the onboarding country selector.
     * GET /api/v1/options/countries
     */
    public function countries(): JsonResponse
    {
        $countries = Country::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return response()->json(['data' => $countries]);
    }

    /**
     * Active schools for a given country.
     * GET /api/v1/options/countries/{countryId}/schools
     */
    public function schools(int $countryId): JsonResponse
    {
        $schools = School::where('country_id', $countryId)
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'city', 'type']);

        return response()->json(['data' => $schools]);
    }

    /**
     * Active learning goals for the onboarding goals step.
     * GET /api/v1/options/learning-goals
     */
    public function learningGoals(): JsonResponse
    {
        $goals = LearningGoal::active()
            ->orderBy('sort_order')
            ->orderBy('label')
            ->get(['id', 'label']);

        return response()->json(['data' => $goals]);
    }
}
