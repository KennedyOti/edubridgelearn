<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\EducationLevel;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Subtopic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurriculumController extends Controller
{
    /**
     * All active curricula.
     * GET /api/v1/curricula
     */
    public function index(): JsonResponse
    {
        $curricula = Curriculum::active()
            ->orderBy('sort_order')
            ->with(['educationLevels' => fn($q) => $q->active()->orderBy('level_order')])
            ->get();

        return response()->json([
            'data' => $curricula->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code,
                'country' => $c->country,
                'description' => $c->description,
                'levels' => $c->educationLevels->map(fn($l) => [
                    'id' => $l->id,
                    'name' => $l->name,
                    'code' => $l->code,
                    'group_label' => $l->group_label,
                ]),
            ]),
        ]);
    }

    /**
     * Full curriculum options (education levels + grades) for onboarding wizard.
     * GET /api/v1/curriculum/options
     */
    public function options(): JsonResponse
    {
        $levels = EducationLevel::active()
            ->with(['grades' => fn($q) => $q->active()->orderBy('grade_order'), 'curriculum:id,name,code'])
            ->orderBy('level_order')
            ->get();

        return response()->json([
            'data' => [
                'education_levels' => $levels->map(fn($l) => [
                    'id' => $l->id,
                    'value' => $l->code,
                    'label' => $l->name,
                    'group' => $l->group_label ?? $l->curriculum->name,
                    'curriculum_code' => $l->curriculum->code,
                ]),
                'grades' => $levels->mapWithKeys(fn($l) => [
                    $l->code => $l->grades->pluck('name'),
                ]),
            ],
        ]);
    }

    /**
     * Subjects for a given education level (by code).
     * GET /api/v1/curriculum/subjects/{levelCode}
     */
    public function subjectsByLevel(string $levelCode): JsonResponse
    {
        $level = EducationLevel::where('code', $levelCode)->active()->first();

        if (!$level) {
            return response()->json(['data' => []]);
        }

        $subjects = Subject::where('education_level_id', $level->id)
            ->active()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $subjects->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'short_name' => $s->short_name,
                'color_hex' => $s->color_hex,
            ]),
        ]);
    }

    /**
     * Subjects for a given education level ID.
     * GET /api/v1/curriculum/levels/{levelId}/subjects
     */
    public function subjectsByLevelId(int $levelId): JsonResponse
    {
        $subjects = Subject::where('education_level_id', $levelId)
            ->active()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $subjects->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'short_name' => $s->short_name,
                'color_hex' => $s->color_hex,
            ]),
        ]);
    }

    /**
     * Topics for a subject.
     * GET /api/v1/curriculum/subjects/{subjectId}/topics
     */
    public function topicsBySubject(int $subjectId): JsonResponse
    {
        $topics = Topic::where('subject_id', $subjectId)
            ->active()
            ->orderBy('sort_order')
            ->with(['subtopics' => fn($q) => $q->active()->orderBy('sort_order')])
            ->get();

        return response()->json([
            'data' => $topics->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'code' => $t->code,
                'subtopics' => $t->subtopics->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'code' => $s->code,
                ]),
            ]),
        ]);
    }
}
