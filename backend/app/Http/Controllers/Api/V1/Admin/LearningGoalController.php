<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningGoal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningGoalController extends Controller
{
    public function index(): JsonResponse
    {
        $goals = LearningGoal::orderBy('sort_order')->orderBy('label')->get();

        return response()->json(['data' => $goals]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255', 'unique:learning_goals,label'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $goal = LearningGoal::create($data);

        return response()->json([
            'data' => $goal,
            'meta' => ['message' => 'Learning goal created.'],
        ], 201);
    }

    public function update(Request $request, LearningGoal $learningGoal): JsonResponse
    {
        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:255', 'unique:learning_goals,label,' . $learningGoal->id],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $learningGoal->update($data);

        return response()->json([
            'data' => $learningGoal->fresh(),
            'meta' => ['message' => 'Learning goal updated.'],
        ]);
    }

    public function destroy(LearningGoal $learningGoal): JsonResponse
    {
        $learningGoal->delete();

        return response()->json(['meta' => ['message' => 'Learning goal deleted.']]);
    }
}
