<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonPurchase;
use App\Models\LessonReview;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonController extends Controller
{
    /**
     * Browse published lessons with filtering.
     * GET /api/v1/lessons
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'curriculum_id' => 'nullable|integer|exists:curricula,id',
            'education_level_id' => 'nullable|integer|exists:education_levels,id',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'topic_id' => 'nullable|integer|exists:topics,id',
            'access_type' => 'nullable|in:free,purchase,subscription',
            'tutor_uuid' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:50',
            'search' => 'nullable|string|max:200',
        ]);

        $query = Lesson::published()
            ->with(['tutor:id,uuid,name,avatar_url', 'subject:id,name', 'educationLevel:id,name', 'topic:id,name']);

        if ($request->curriculum_id) {
            $query->where('curriculum_id', $request->curriculum_id);
        }

        if ($request->education_level_id) {
            $query->where('education_level_id', $request->education_level_id);
        }

        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->topic_id) {
            $query->where('topic_id', $request->topic_id);
        }

        if ($request->access_type) {
            $query->where('access_type', $request->access_type);
        }

        if ($request->tutor_uuid) {
            $query->whereHas('tutor', fn($q) => $q->where('uuid', $request->tutor_uuid));
        }

        if ($request->search) {
            $query->where(fn($q) => $q->where('title', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%"));
        }

        $lessons = $query->latest('published_at')->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => $lessons->map(fn($l) => $this->formatLesson($l)),
            'meta' => [
                'total' => $lessons->total(),
                'current_page' => $lessons->currentPage(),
                'last_page' => $lessons->lastPage(),
            ],
        ]);
    }

    /**
     * Get lesson details. Streaming URL only for purchased/free lessons.
     * GET /api/v1/lessons/{uuid}
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $lesson = Lesson::where('uuid', $uuid)
            ->published()
            ->with(['tutor:id,uuid,name,avatar_url', 'subject:id,name', 'educationLevel:id,name', 'topic:id,name', 'chapters', 'subtitles'])
            ->firstOrFail();

        $user = $request->user();
        $hasAccess = $this->userHasAccessToLesson($user, $lesson);

        $data = $this->formatLesson($lesson, true);

        // Only provide streaming URL if user has access
        if ($hasAccess) {
            $data['video_urls'] = [
                '360p' => $lesson->video_url_360p,
                '720p' => $lesson->video_url_720p,
                '1080p' => $lesson->video_url_1080p,
            ];

            // Attach student's progress if authenticated
            if ($user) {
                $progress = LessonProgress::where('student_id', $user->id)
                    ->where('lesson_id', $lesson->id)
                    ->first();

                $data['progress'] = $progress ? [
                    'watched_seconds' => $progress->watched_seconds,
                    'last_position_seconds' => $progress->last_position_seconds,
                    'is_completed' => $progress->is_completed,
                    'percentage' => $progress->percentage,
                ] : null;
            }
        } else {
            $data['video_urls'] = null;
            $data['requires_purchase'] = true;
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Tutor uploads a lesson (metadata; video upload handled via signed S3 URL separately).
     * POST /api/v1/tutors/lessons
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'curriculum_id' => 'nullable|integer|exists:curricula,id',
            'education_level_id' => 'nullable|integer|exists:education_levels,id',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'topic_id' => 'nullable|integer|exists:topics,id',
            'subtopic_id' => 'nullable|integer|exists:subtopics,id',
            'access_type' => 'required|in:free,purchase,subscription',
            'price' => 'required_if:access_type,purchase|nullable|integer|min:0',
            'currency' => 'nullable|string|size:3',
            'allows_download' => 'nullable|boolean',
            'thumbnail_url' => 'nullable|url|max:500',
        ]);

        $tutor = $request->user();

        if (!$tutor->tutorProfile?->isApproved()) {
            return response()->json(['errors' => [['message' => 'Only approved tutors can upload lessons.']]], 403);
        }

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'title' => $request->title,
            'description' => $request->description,
            'curriculum_id' => $request->curriculum_id,
            'education_level_id' => $request->education_level_id,
            'subject_id' => $request->subject_id,
            'topic_id' => $request->topic_id,
            'subtopic_id' => $request->subtopic_id,
            'access_type' => $request->access_type,
            'price' => $request->access_type === 'purchase' ? (int) $request->price : 0,
            'currency' => $request->currency ?? 'USD',
            'allows_download' => $request->allows_download ?? false,
            'thumbnail_url' => $request->thumbnail_url,
            'status' => 'uploading',
            'transcoding_status' => 'pending',
        ]);

        return response()->json([
            'data' => $this->formatLesson($lesson),
            'meta' => ['message' => 'Lesson created. Upload your video to the provided URL.'],
        ], 201);
    }

    /**
     * Tutor updates lesson metadata.
     * PUT /api/v1/tutors/lessons/{uuid}
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:5000',
            'access_type' => 'sometimes|in:free,purchase,subscription',
            'price' => 'nullable|integer|min:0',
            'allows_download' => 'nullable|boolean',
            'thumbnail_url' => 'nullable|url|max:500',
        ]);

        $tutor = $request->user();
        $lesson = Lesson::where('uuid', $uuid)->where('tutor_id', $tutor->id)->firstOrFail();

        if (in_array($lesson->status, ['pending_review', 'published'])) {
            // Cannot edit while in review or published - must unpublish first
            $lesson->update(['status' => 'unpublished']);
        }

        $lesson->update($request->only([
            'title', 'description', 'access_type', 'price', 'allows_download', 'thumbnail_url',
        ]));

        return response()->json([
            'data' => $this->formatLesson($lesson->fresh()),
            'meta' => ['message' => 'Lesson updated.'],
        ]);
    }

    /**
     * Tutor submits lesson for review/publish.
     * POST /api/v1/tutors/lessons/{uuid}/publish
     */
    public function publish(Request $request, string $uuid): JsonResponse
    {
        $tutor = $request->user();
        $lesson = Lesson::where('uuid', $uuid)->where('tutor_id', $tutor->id)->firstOrFail();

        if ($lesson->transcoding_status !== 'completed') {
            return response()->json(['errors' => [['message' => 'Video must finish processing before publishing.']]], 422);
        }

        if (!in_array($lesson->status, ['uploading', 'unpublished', 'rejected'])) {
            return response()->json(['errors' => [['message' => 'Lesson cannot be submitted in its current state.']]], 422);
        }

        // Auto-publish or send to review based on config
        $lesson->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return response()->json([
            'data' => $this->formatLesson($lesson->fresh()),
            'meta' => ['message' => 'Lesson published successfully.'],
        ]);
    }

    /**
     * Update student's watching progress.
     * POST /api/v1/lessons/{uuid}/progress
     */
    public function updateProgress(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'watched_seconds' => 'required|integer|min:0',
            'last_position_seconds' => 'required|integer|min:0',
        ]);

        $student = $request->user();
        $lesson = Lesson::where('uuid', $uuid)->published()->firstOrFail();

        if (!$this->userHasAccessToLesson($student, $lesson)) {
            return response()->json(['errors' => [['message' => 'You do not have access to this lesson.']]], 403);
        }

        $isCompleted = $lesson->duration_seconds
            && $request->watched_seconds >= ($lesson->duration_seconds * 0.9); // 90% = completed

        $progress = LessonProgress::updateOrCreate(
            ['student_id' => $student->id, 'lesson_id' => $lesson->id],
            [
                'watched_seconds' => max($request->watched_seconds, 0),
                'last_position_seconds' => $request->last_position_seconds,
                'is_completed' => $isCompleted,
                'completed_at' => $isCompleted ? (now()) : null,
                'last_watched_at' => now(),
            ]
        );

        return response()->json([
            'data' => [
                'is_completed' => $progress->is_completed,
                'watched_seconds' => $progress->watched_seconds,
                'percentage' => $progress->percentage,
            ],
        ]);
    }

    /**
     * Student reviews a lesson.
     * POST /api/v1/lessons/{uuid}/review
     */
    public function submitReview(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        $student = $request->user();
        $lesson = Lesson::where('uuid', $uuid)->published()->firstOrFail();

        // Must have purchased or have progress to review
        $hasProgress = LessonProgress::where('student_id', $student->id)
            ->where('lesson_id', $lesson->id)
            ->where('is_completed', true)
            ->exists();

        if (!$hasProgress && !$this->userHasAccessToLesson($student, $lesson)) {
            return response()->json(['errors' => [['message' => 'Complete the lesson before reviewing.']]], 422);
        }

        LessonReview::updateOrCreate(
            ['lesson_id' => $lesson->id, 'student_id' => $student->id],
            ['rating' => $request->rating, 'review_text' => $request->review_text, 'is_visible' => true]
        );

        // Recalculate avg rating
        $avg = LessonReview::where('lesson_id', $lesson->id)->where('is_visible', true)->avg('rating');
        $lesson->update(['avg_rating' => round($avg, 2)]);

        return response()->json(['meta' => ['message' => 'Review submitted.']]);
    }

    /**
     * Purchase a paid lesson.
     * POST /api/v1/lessons/{uuid}/purchase
     */
    public function purchase(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['gateway' => 'required|in:mpesa,stripe,paypal,flutterwave']);

        $student = $request->user();
        $lesson = Lesson::where('uuid', $uuid)->published()->firstOrFail();

        if ($lesson->access_type === 'free') {
            return response()->json(['errors' => [['message' => 'This lesson is free.']]], 422);
        }

        if (LessonPurchase::where('student_id', $student->id)->where('lesson_id', $lesson->id)->exists()) {
            return response()->json(['errors' => [['message' => 'You already own this lesson.']]], 409);
        }

        // Create payment record (actual gateway integration would be separate)
        $payment = DB::transaction(function () use ($student, $lesson, $request) {
            $payment = \App\Models\Payment::create([
                'user_id' => $student->id,
                'gateway' => $request->gateway,
                'amount' => $lesson->price,
                'currency' => $lesson->currency,
                'status' => 'pending',
                'description' => "Purchase: {$lesson->title}",
                'payable_type' => LessonPurchase::class,
            ]);

            return $payment;
        });

        return response()->json([
            'data' => [
                'payment_id' => $payment->uuid,
                'amount' => $lesson->price / 100,
                'currency' => $lesson->currency,
                'status' => 'pending',
            ],
            'meta' => ['message' => 'Payment initiated. Complete payment to access the lesson.'],
        ], 201);
    }

    /**
     * Get tutor's own lessons.
     * GET /api/v1/tutors/lessons
     */
    public function tutorLessons(Request $request): JsonResponse
    {
        $tutor = $request->user();

        $lessons = Lesson::where('tutor_id', $tutor->id)
            ->with(['subject:id,name', 'educationLevel:id,name', 'topic:id,name'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $lessons->map(fn($l) => $this->formatLesson($l)),
            'meta' => ['total' => $lessons->total(), 'current_page' => $lessons->currentPage()],
        ]);
    }

    /**
     * Delete a tutor's own lesson (soft delete).
     * DELETE /api/v1/tutors/lessons/{uuid}
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $tutor = $request->user();
        $lesson = Lesson::where('uuid', $uuid)->where('tutor_id', $tutor->id)->firstOrFail();

        $lesson->update(['status' => 'unpublished']);
        $lesson->delete();

        return response()->json(['meta' => ['message' => 'Lesson deleted.']]);
    }

    // ── Helper: check if user can access lesson content ───────────────────────

    private function userHasAccessToLesson(?object $user, Lesson $lesson): bool
    {
        if ($lesson->access_type === 'free') {
            return true;
        }

        if (!$user) {
            return false;
        }

        // Tutor owns the lesson
        if ($lesson->tutor_id === $user->id) {
            return true;
        }

        // Admin
        if ($user->isAdmin()) {
            return true;
        }

        // Check purchase
        if ($lesson->access_type === 'purchase') {
            return LessonPurchase::where('student_id', $user->id)
                ->where('lesson_id', $lesson->id)
                ->exists();
        }

        // Check active subscription
        if ($lesson->access_type === 'subscription') {
            return $user->activeSubscription()->exists();
        }

        return false;
    }

    private function formatLesson(Lesson $lesson, bool $detailed = false): array
    {
        $data = [
            'id' => $lesson->uuid,
            'title' => $lesson->title,
            'description' => $lesson->description,
            'thumbnail_url' => $lesson->thumbnail_url,
            'duration_seconds' => $lesson->duration_seconds,
            'access_type' => $lesson->access_type,
            'price' => $lesson->price / 100,
            'currency' => $lesson->currency,
            'status' => $lesson->status,
            'avg_rating' => $lesson->avg_rating,
            'views_count' => $lesson->views_count,
            'purchases_count' => $lesson->purchases_count,
            'published_at' => $lesson->published_at,
            'created_at' => $lesson->created_at,
        ];

        if ($lesson->relationLoaded('tutor')) {
            $data['tutor'] = [
                'id' => $lesson->tutor->uuid,
                'name' => $lesson->tutor->name,
                'avatar_url' => $lesson->tutor->avatar_url,
            ];
        }

        if ($lesson->relationLoaded('subject') && $lesson->subject) {
            $data['subject'] = ['id' => $lesson->subject->id, 'name' => $lesson->subject->name];
        }

        if ($lesson->relationLoaded('educationLevel') && $lesson->educationLevel) {
            $data['education_level'] = ['id' => $lesson->educationLevel->id, 'name' => $lesson->educationLevel->name];
        }

        if ($lesson->relationLoaded('topic') && $lesson->topic) {
            $data['topic'] = ['id' => $lesson->topic->id, 'name' => $lesson->topic->name];
        }

        if ($detailed) {
            if ($lesson->relationLoaded('chapters')) {
                $data['chapters'] = $lesson->chapters->map(fn($c) => [
                    'title' => $c->title,
                    'start_second' => $c->start_second,
                    'end_second' => $c->end_second,
                ]);
            }

            if ($lesson->relationLoaded('subtitles')) {
                $data['subtitles'] = $lesson->subtitles->where('is_active', true)->map(fn($s) => [
                    'language' => $s->language,
                    'file_url' => $s->file_url,
                    'is_auto_generated' => $s->is_auto_generated,
                ]);
            }
        }

        return $data;
    }
}
