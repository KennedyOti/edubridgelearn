<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\EducationLevel;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CurriculumManagementController extends Controller
{
    /**
     * Full taxonomy: curricula -> education levels -> grades.
     */
    public function index(): JsonResponse
    {
        $curricula = Curriculum::orderBy('sort_order')
            ->with(['educationLevels' => fn($q) => $q->orderBy('level_order'), 'educationLevels.grades' => fn($q) => $q->orderBy('grade_order')])
            ->get();

        return response()->json(['data' => $curricula]);
    }

    // ── Education levels ────────────────────────────────────────────────────

    public function storeLevel(Request $request): JsonResponse
    {
        $data = $request->validate([
            'curriculum_id' => ['required', 'integer', 'exists:curricula,id'],
            'name' => ['required', 'string', 'max:150'],
            'code' => ['nullable', 'string', 'max:100', 'unique:education_levels,code'],
            'group_label' => ['nullable', 'string', 'max:100'],
            'level_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $data['code'] = $data['code'] ?? Str::slug($data['name'], '_');

        $level = EducationLevel::create($data);

        return response()->json([
            'data' => $level->load('grades'),
            'meta' => ['message' => 'Education level created.'],
        ], 201);
    }

    public function updateLevel(Request $request, EducationLevel $level): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'code' => ['sometimes', 'string', 'max:100', 'unique:education_levels,code,' . $level->id],
            'group_label' => ['nullable', 'string', 'max:100'],
            'level_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $level->update($data);

        return response()->json([
            'data' => $level->fresh()->load('grades'),
            'meta' => ['message' => 'Education level updated.'],
        ]);
    }

    public function destroyLevel(EducationLevel $level): JsonResponse
    {
        $level->delete();

        return response()->json(['meta' => ['message' => 'Education level deleted.']]);
    }

    // ── Grades ──────────────────────────────────────────────────────────────

    public function storeGrade(Request $request): JsonResponse
    {
        $data = $request->validate([
            'education_level_id' => ['required', 'integer', 'exists:education_levels,id'],
            'name' => ['required', 'string', 'max:100'],
            'grade_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $data['code'] = Str::slug($data['name'], '_');

        $grade = Grade::create($data);

        return response()->json([
            'data' => $grade,
            'meta' => ['message' => 'Grade created.'],
        ], 201);
    }

    public function updateGrade(Request $request, Grade $grade): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'grade_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        if (isset($data['name'])) {
            $data['code'] = Str::slug($data['name'], '_');
        }

        $grade->update($data);

        return response()->json([
            'data' => $grade->fresh(),
            'meta' => ['message' => 'Grade updated.'],
        ]);
    }

    public function destroyGrade(Grade $grade): JsonResponse
    {
        $grade->delete();

        return response()->json(['meta' => ['message' => 'Grade deleted.']]);
    }
}
