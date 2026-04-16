<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Resource;
use App\Models\ResourcePurchase;
use App\Models\ResourceReview;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResourceController extends Controller
{
    // ── Public: browse marketplace ────────────────────────────────────────────

    /**
     * Browse published resources with filtering/sorting.
     * GET /api/v1/resources
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'type'               => 'nullable|in:notes,practice_questions,assignment,past_paper,flashcard_deck,simulation,worksheet',
            'curriculum_id'      => 'nullable|integer|exists:curricula,id',
            'education_level_id' => 'nullable|integer|exists:education_levels,id',
            'subject_id'         => 'nullable|integer|exists:subjects,id',
            'topic_id'           => 'nullable|integer|exists:topics,id',
            'access_type'        => 'nullable|in:free,purchase,subscription',
            'search'             => 'nullable|string|max:200',
            'min_rating'         => 'nullable|numeric|min:0|max:5',
            'exam_year'          => 'nullable|integer',
            'examining_body'     => 'nullable|string|max:100',
            'tag'                => 'nullable|string',
            'sort'               => 'nullable|in:newest,popular,top_rated,price_asc,price_desc',
            'per_page'           => 'nullable|integer|min:1|max:48',
        ]);

        $query = Resource::published()
            ->with([
                'creator:id,uuid,name,avatar_url,role',
                'curriculum:id,name,code',
                'educationLevel:id,name,code',
                'subject:id,name',
                'tags:id,name,slug',
            ]);

        if ($request->type) $query->where('type', $request->type);
        if ($request->curriculum_id) $query->where('curriculum_id', $request->curriculum_id);
        if ($request->education_level_id) $query->where('education_level_id', $request->education_level_id);
        if ($request->subject_id) $query->where('subject_id', $request->subject_id);
        if ($request->topic_id) $query->where('topic_id', $request->topic_id);
        if ($request->access_type) $query->where('access_type', $request->access_type);
        if ($request->exam_year) $query->where('exam_year', $request->exam_year);
        if ($request->examining_body) $query->where('examining_body', 'like', "%{$request->examining_body}%");
        if ($request->min_rating) $query->where('avg_rating', '>=', $request->min_rating);

        if ($request->search) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('title', 'like', "%{$s}%")
                ->orWhere('description', 'like', "%{$s}%")
            );
        }

        if ($request->tag) {
            $query->whereHas('tags', fn($q) => $q->where('slug', $request->tag));
        }

        match ($request->sort ?? 'newest') {
            'popular'    => $query->orderByDesc('downloads_count'),
            'top_rated'  => $query->orderByDesc('avg_rating')->orderByDesc('purchases_count'),
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default      => $query->orderByDesc('published_at'),
        };

        $resources = $query->paginate($request->per_page ?? 12);

        // Annotate purchase status for authenticated users
        $purchasedIds = [];
        if ($user = $request->user()) {
            $purchasedIds = ResourcePurchase::where('student_id', $user->id)
                ->pluck('resource_id')->toArray();
        }

        return response()->json([
            'data' => $resources->map(fn($r) => $this->formatResource($r, compact('purchasedIds'))),
            'meta' => [
                'total'        => $resources->total(),
                'current_page' => $resources->currentPage(),
                'last_page'    => $resources->lastPage(),
                'per_page'     => $resources->perPage(),
            ],
        ]);
    }

    /**
     * Get single resource detail. Non-published resources visible to creator & admins only.
     * GET /api/v1/resources/{uuid}
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $resource = Resource::where('uuid', $uuid)
            ->with([
                'creator:id,uuid,name,avatar_url,role',
                'curriculum:id,name,code',
                'educationLevel:id,name,code',
                'subject:id,name',
                'topic:id,name',
                'subtopic:id,name',
                'tags:id,name,slug',
                'reviews.student:id,uuid,name,avatar_url',
            ])
            ->firstOrFail();

        if ($resource->status !== 'published') {
            $user = $request->user();
            if (!$user || ($resource->creator_id !== $user->id && !in_array($user->role, ['admin', 'super_admin']))) {
                abort(404);
            }
        }

        $hasPurchased = false;
        $purchase     = null;
        $isCreator    = false;
        $isAdmin      = false;

        if ($user = $request->user()) {
            $purchase     = ResourcePurchase::where('student_id', $user->id)->where('resource_id', $resource->id)->first();
            $hasPurchased = (bool) $purchase;
            $isCreator    = $resource->creator_id === $user->id;
            $isAdmin      = in_array($user->role, ['admin', 'super_admin']);
        }

        $showFileUrl = $hasPurchased || $resource->access_type === 'free' || $isCreator || $isAdmin;

        return response()->json([
            'data' => $this->formatResource($resource, [
                'purchasedIds' => $hasPurchased ? [$resource->id] : [],
                'detailed'     => true,
                'showFileUrl'  => $showFileUrl,
                'download_count' => $purchase?->download_count ?? 0,
            ]),
        ]);
    }

    // ── Creator: upload & manage ──────────────────────────────────────────────

    /**
     * Upload a new resource (tutor / contributor).
     * POST /api/v1/resources
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string|max:5000',
            'type'               => 'required|in:notes,practice_questions,assignment,past_paper,flashcard_deck,simulation,worksheet',
            'file'               => 'required|file|max:51200', // 50 MB
            'preview_file'       => 'nullable|file|max:5120',  // 5 MB
            'curriculum_id'      => 'nullable|integer|exists:curricula,id',
            'education_level_id' => 'nullable|integer|exists:education_levels,id',
            'subject_id'         => 'nullable|integer|exists:subjects,id',
            'topic_id'           => 'nullable|integer|exists:topics,id',
            'subtopic_id'        => 'nullable|integer|exists:subtopics,id',
            'exam_year'          => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'examining_body'     => 'nullable|string|max:100',
            'access_type'        => 'required|in:free,purchase,subscription',
            'price'              => 'required_if:access_type,purchase|nullable|integer|min:0',
            'currency'           => 'nullable|string|size:3',
            'tags'               => 'nullable|array|max:10',
            'tags.*'             => 'string|max:50',
        ]);

        $user = $request->user();
        $this->authorizeCanUpload($user);

        $file     = $request->file('file');
        $filePath = $file->store("resources/{$user->uuid}", 'public');

        $previewPath = null;
        if ($request->hasFile('preview_file')) {
            $previewPath = $request->file('preview_file')->store("resources/previews/{$user->uuid}", 'public');
        }

        $resource = Resource::create([
            'creator_id'         => $user->id,
            'title'              => $request->title,
            'description'        => $request->description,
            'type'               => $request->type,
            'file_url'           => Storage::url($filePath),
            'preview_url'        => $previewPath ? Storage::url($previewPath) : null,
            'file_size_bytes'    => $file->getSize(),
            'file_mime_type'     => $file->getMimeType(),
            'curriculum_id'      => $request->curriculum_id,
            'education_level_id' => $request->education_level_id,
            'subject_id'         => $request->subject_id,
            'topic_id'           => $request->topic_id,
            'subtopic_id'        => $request->subtopic_id,
            'exam_year'          => $request->exam_year,
            'examining_body'     => $request->examining_body,
            'access_type'        => $request->access_type,
            'price'              => $request->access_type === 'purchase' ? ($request->price ?? 0) : 0,
            'currency'           => $request->currency ?? 'USD',
            'status'             => 'draft',
        ]);

        if ($request->tags) {
            $resource->tags()->sync($this->resolveTagIds($request->tags));
        }

        $resource->load(['creator:id,uuid,name,avatar_url', 'subject:id,name', 'tags:id,name,slug']);

        return response()->json([
            'data' => $this->formatResource($resource, ['showFileUrl' => true]),
            'meta' => ['message' => 'Resource uploaded. Submit it for review when ready.'],
        ], 201);
    }

    /**
     * Update own resource (only while draft or rejected).
     * PUT /api/v1/resources/{uuid}
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'title'              => 'sometimes|string|max:255',
            'description'        => 'nullable|string|max:5000',
            'type'               => 'sometimes|in:notes,practice_questions,assignment,past_paper,flashcard_deck,simulation,worksheet',
            'curriculum_id'      => 'nullable|integer|exists:curricula,id',
            'education_level_id' => 'nullable|integer|exists:education_levels,id',
            'subject_id'         => 'nullable|integer|exists:subjects,id',
            'topic_id'           => 'nullable|integer|exists:topics,id',
            'subtopic_id'        => 'nullable|integer|exists:subtopics,id',
            'exam_year'          => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'examining_body'     => 'nullable|string|max:100',
            'access_type'        => 'sometimes|in:free,purchase,subscription',
            'price'              => 'nullable|integer|min:0',
            'currency'           => 'nullable|string|size:3',
            'tags'               => 'nullable|array|max:10',
            'tags.*'             => 'string|max:50',
        ]);

        $user     = $request->user();
        $resource = Resource::where('uuid', $uuid)->firstOrFail();

        if ($resource->creator_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['errors' => [['message' => 'Not authorised to edit this resource.']]], 403);
        }

        if (!in_array($resource->status, ['draft', 'rejected']) && !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['errors' => [['message' => 'Published resources cannot be edited directly. Upload a new version.']]], 422);
        }

        $fields = ['title', 'description', 'type', 'curriculum_id', 'education_level_id', 'subject_id',
                   'topic_id', 'subtopic_id', 'exam_year', 'examining_body', 'access_type', 'price', 'currency'];

        $updateData = [];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $updateData[$field] = $request->input($field);
            }
        }

        // Move rejected resource back to draft on edit
        if ($resource->status === 'rejected') {
            $updateData['status']           = 'draft';
            $updateData['rejection_reason'] = null;
        }

        $resource->update($updateData);

        if ($request->has('tags')) {
            $resource->tags()->sync($request->tags ? $this->resolveTagIds($request->tags) : []);
        }

        $resource->load(['creator:id,uuid,name,avatar_url', 'subject:id,name', 'tags:id,name,slug']);

        return response()->json([
            'data' => $this->formatResource($resource->fresh(), ['showFileUrl' => true]),
            'meta' => ['message' => 'Resource updated.'],
        ]);
    }

    /**
     * Soft-delete own resource.
     * DELETE /api/v1/resources/{uuid}
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $user     = $request->user();
        $resource = Resource::where('uuid', $uuid)->firstOrFail();

        if ($resource->creator_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['errors' => [['message' => 'Not authorised to delete this resource.']]], 403);
        }

        $resource->delete();

        return response()->json(['meta' => ['message' => 'Resource deleted.']]);
    }

    /**
     * Submit draft/rejected resource for admin review.
     * POST /api/v1/resources/{uuid}/submit
     */
    public function submit(Request $request, string $uuid): JsonResponse
    {
        $user     = $request->user();
        $resource = Resource::where('uuid', $uuid)->where('creator_id', $user->id)->firstOrFail();

        if (!in_array($resource->status, ['draft', 'rejected'])) {
            return response()->json(['errors' => [['message' => 'Only draft or rejected resources can be submitted for review.']]], 422);
        }

        $resource->update(['status' => 'pending_review', 'rejection_reason' => null]);

        return response()->json(['meta' => ['message' => 'Resource submitted for review.']]);
    }

    /**
     * List the authenticated creator's own resources.
     * GET /api/v1/resources/my-uploads
     */
    public function myResources(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => 'nullable|in:draft,pending_review,published,rejected,unlisted',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = Resource::where('creator_id', $request->user()->id)
            ->with(['subject:id,name', 'educationLevel:id,name,code', 'tags:id,name,slug'])
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $resources = $query->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => $resources->map(fn($r) => $this->formatResource($r, ['showFileUrl' => true])),
            'meta' => [
                'total'        => $resources->total(),
                'current_page' => $resources->currentPage(),
                'last_page'    => $resources->lastPage(),
            ],
        ]);
    }

    // ── Student: purchase & download ──────────────────────────────────────────

    /**
     * Purchase a paid resource.
     * POST /api/v1/resources/{uuid}/purchase
     */
    public function purchase(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['errors' => [['message' => 'Only students can purchase resources.']]], 403);
        }

        $resource = Resource::where('uuid', $uuid)->published()->firstOrFail();

        if ($resource->access_type === 'free') {
            return response()->json(['errors' => [['message' => 'This resource is free — download it directly.']]], 422);
        }

        if (ResourcePurchase::where('student_id', $user->id)->where('resource_id', $resource->id)->exists()) {
            return response()->json(['errors' => [['message' => 'You have already purchased this resource.']]], 422);
        }

        DB::transaction(function () use ($user, $resource) {
            $payment = Payment::create([
                'user_id'      => $user->id,
                'gateway'      => 'wallet',
                'amount'       => $resource->price,
                'currency'     => $resource->currency,
                'status'       => 'completed',
                'description'  => "Resource purchase: {$resource->title}",
                'payable_type' => Resource::class,
                'payable_id'   => $resource->id,
                'paid_at'      => now(),
            ]);

            ResourcePurchase::create([
                'student_id'   => $user->id,
                'resource_id'  => $resource->id,
                'payment_id'   => $payment->id,
                'amount_paid'  => $resource->price,
                'currency'     => $resource->currency,
                'purchased_at' => now(),
            ]);

            $resource->increment('purchases_count');
        });

        return response()->json([
            'meta' => ['message' => 'Purchase successful. You can now download this resource.'],
        ], 201);
    }

    /**
     * Generate a secure download link and track downloads.
     * POST /api/v1/resources/{uuid}/download
     */
    public function download(Request $request, string $uuid): JsonResponse
    {
        $user     = $request->user();
        $resource = Resource::where('uuid', $uuid)->published()->firstOrFail();

        $hasAccess = false;
        $purchase  = null;

        if ($resource->access_type === 'free') {
            $hasAccess = true;
        } elseif ($resource->creator_id === $user->id || in_array($user->role, ['admin', 'super_admin'])) {
            $hasAccess = true;
        } else {
            $purchase  = ResourcePurchase::where('student_id', $user->id)->where('resource_id', $resource->id)->first();
            $hasAccess = (bool) $purchase;
        }

        if (!$hasAccess) {
            return response()->json(['errors' => [['message' => 'You do not have access to download this resource.']]], 403);
        }

        $resource->increment('downloads_count');
        if ($purchase) {
            $purchase->increment('download_count');
        }

        $ext      = pathinfo(parse_url($resource->file_url, PHP_URL_PATH), PATHINFO_EXTENSION);
        $fileName = Str::slug($resource->title) . ($ext ? ".{$ext}" : '');

        return response()->json([
            'data' => [
                'download_url' => $resource->file_url,
                'file_name'    => $fileName,
                'file_size'    => $resource->file_size_bytes,
            ],
            'meta' => ['message' => 'Download link ready.'],
        ]);
    }

    /**
     * List resources purchased by the authenticated student.
     * GET /api/v1/resources/purchased
     */
    public function purchasedResources(Request $request): JsonResponse
    {
        $request->validate(['per_page' => 'nullable|integer|min:1|max:50']);

        $purchases = ResourcePurchase::where('student_id', $request->user()->id)
            ->with([
                'resource.creator:id,uuid,name,avatar_url',
                'resource.subject:id,name',
                'resource.educationLevel:id,name',
                'resource.tags:id,name,slug',
            ])
            ->latest('purchased_at')
            ->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => $purchases->map(function ($p) {
                return array_merge(
                    $this->formatResource($p->resource, ['purchasedIds' => [$p->resource_id], 'showFileUrl' => true]),
                    [
                        'purchased_at'   => $p->purchased_at,
                        'amount_paid'    => $p->amount_paid,
                        'download_count' => $p->download_count,
                    ]
                );
            }),
            'meta' => [
                'total'        => $purchases->total(),
                'current_page' => $purchases->currentPage(),
                'last_page'    => $purchases->lastPage(),
            ],
        ]);
    }

    // ── Reviews ───────────────────────────────────────────────────────────────

    /**
     * Add or update a review (students who purchased or free resource).
     * POST /api/v1/resources/{uuid}/review
     */
    public function addReview(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'rating'      => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:1000',
        ]);

        $user     = $request->user();
        $resource = Resource::where('uuid', $uuid)->published()->firstOrFail();

        $hasPurchased = $resource->access_type === 'free'
            || ResourcePurchase::where('student_id', $user->id)->where('resource_id', $resource->id)->exists();

        if (!$hasPurchased) {
            return response()->json(['errors' => [['message' => 'Only students who have accessed this resource can leave a review.']]], 403);
        }

        $review = ResourceReview::updateOrCreate(
            ['resource_id' => $resource->id, 'student_id' => $user->id],
            ['rating' => $request->rating, 'review_text' => $request->review_text, 'is_visible' => true]
        );

        // Recalculate average rating
        $avg = ResourceReview::where('resource_id', $resource->id)->where('is_visible', true)->avg('rating');
        $resource->update(['avg_rating' => round($avg, 2)]);

        return response()->json([
            'data' => [
                'id'          => $review->id,
                'rating'      => $review->rating,
                'review_text' => $review->review_text,
                'created_at'  => $review->created_at,
            ],
            'meta' => ['message' => 'Review submitted.'],
        ]);
    }

    // ── Admin moderation ──────────────────────────────────────────────────────

    /**
     * Admin: list all resources across all statuses.
     * GET /api/v1/admin/resources
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => 'nullable|in:draft,pending_review,published,rejected,unlisted',
            'type'     => 'nullable|in:notes,practice_questions,assignment,past_paper,flashcard_deck,simulation,worksheet',
            'search'   => 'nullable|string|max:200',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = Resource::withTrashed()
            ->with(['creator:id,uuid,name,avatar_url,role', 'subject:id,name', 'educationLevel:id,name'])
            ->latest();

        if ($request->status) $query->where('status', $request->status);
        if ($request->type) $query->where('type', $request->type);
        if ($request->search) $query->where('title', 'like', "%{$request->search}%");

        $resources = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $resources->map(fn($r) => $this->formatResource($r, ['showFileUrl' => true])),
            'meta' => [
                'total'        => $resources->total(),
                'current_page' => $resources->currentPage(),
                'last_page'    => $resources->lastPage(),
            ],
        ]);
    }

    /**
     * Admin: approve a pending resource.
     * POST /api/v1/admin/resources/{uuid}/approve
     */
    public function adminApprove(string $uuid): JsonResponse
    {
        $resource = Resource::where('uuid', $uuid)->firstOrFail();

        if ($resource->status !== 'pending_review') {
            return response()->json(['errors' => [['message' => 'Only resources pending review can be approved.']]], 422);
        }

        $resource->update([
            'status'           => 'published',
            'published_at'     => $resource->published_at ?? now(),
            'rejection_reason' => null,
        ]);

        return response()->json(['meta' => ['message' => 'Resource approved and published.']]);
    }

    /**
     * Admin: reject a pending resource with a reason.
     * POST /api/v1/admin/resources/{uuid}/reject
     */
    public function adminReject(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:1000']);

        $resource = Resource::where('uuid', $uuid)->firstOrFail();

        if ($resource->status !== 'pending_review') {
            return response()->json(['errors' => [['message' => 'Only resources pending review can be rejected.']]], 422);
        }

        $resource->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return response()->json(['meta' => ['message' => 'Resource rejected.']]);
    }

    /**
     * Admin: unlist a published resource.
     * POST /api/v1/admin/resources/{uuid}/unlist
     */
    public function adminUnlist(string $uuid): JsonResponse
    {
        $resource = Resource::where('uuid', $uuid)->firstOrFail();
        $resource->update(['status' => 'unlisted']);

        return response()->json(['meta' => ['message' => 'Resource unlisted.']]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function authorizeCanUpload(object $user): void
    {
        if (!in_array($user->role, ['tutor', 'contributor', 'admin', 'super_admin'])) {
            abort(403, 'Only tutors and contributors can upload resources.');
        }
    }

    private function resolveTagIds(array $tagNames): array
    {
        return collect($tagNames)
            ->filter()
            ->map(fn($name) => Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => trim($name)]
            )->id)
            ->toArray();
    }

    private function formatResource(Resource $resource, array $options = []): array
    {
        $purchasedIds = $options['purchasedIds'] ?? [];
        $detailed     = $options['detailed']     ?? false;
        $showFileUrl  = $options['showFileUrl']  ?? false;
        $downloadCount = $options['download_count'] ?? 0;
        $isPurchased  = in_array($resource->id, $purchasedIds);

        $data = [
            'id'               => $resource->uuid,
            'title'            => $resource->title,
            'description'      => $resource->description,
            'type'             => $resource->type,
            'type_label'       => $this->typeLabel($resource->type),
            'access_type'      => $resource->access_type,
            'price'            => $resource->price,
            'price_formatted'  => $resource->price > 0
                ? number_format($resource->price / 100, 2) . ' ' . $resource->currency
                : 'Free',
            'currency'         => $resource->currency,
            'status'           => $resource->status,
            'rejection_reason' => $resource->rejection_reason,
            'downloads_count'  => $resource->downloads_count,
            'purchases_count'  => $resource->purchases_count,
            'avg_rating'       => $resource->avg_rating,
            'version'          => $resource->version,
            'file_size_bytes'  => $resource->file_size_bytes,
            'file_size_label'  => $this->formatFileSize($resource->file_size_bytes),
            'file_mime_type'   => $resource->file_mime_type,
            'preview_url'      => $resource->preview_url,
            'exam_year'        => $resource->exam_year,
            'examining_body'   => $resource->examining_body,
            'is_purchased'     => $isPurchased,
            'published_at'     => $resource->published_at,
            'created_at'       => $resource->created_at,
            'updated_at'       => $resource->updated_at,
        ];

        if ($showFileUrl) {
            $data['file_url']      = $resource->file_url;
            $data['download_count'] = $downloadCount;
        }

        if ($resource->relationLoaded('creator') && $resource->creator) {
            $data['creator'] = [
                'id'         => $resource->creator->uuid,
                'name'       => $resource->creator->name,
                'avatar_url' => $resource->creator->avatar_url,
                'role'       => $resource->creator->role,
            ];
        }

        if ($resource->relationLoaded('curriculum') && $resource->curriculum) {
            $data['curriculum'] = [
                'id'   => $resource->curriculum->id,
                'name' => $resource->curriculum->name,
                'code' => $resource->curriculum->code ?? null,
            ];
        }

        if ($resource->relationLoaded('educationLevel') && $resource->educationLevel) {
            $data['education_level'] = [
                'id'   => $resource->educationLevel->id,
                'name' => $resource->educationLevel->name,
            ];
        }

        if ($resource->relationLoaded('subject') && $resource->subject) {
            $data['subject'] = ['id' => $resource->subject->id, 'name' => $resource->subject->name];
        }

        if ($resource->relationLoaded('topic') && $resource->topic) {
            $data['topic'] = ['id' => $resource->topic->id, 'name' => $resource->topic->name];
        }

        if ($resource->relationLoaded('subtopic') && $resource->subtopic) {
            $data['subtopic'] = ['id' => $resource->subtopic->id, 'name' => $resource->subtopic->name];
        }

        if ($resource->relationLoaded('tags')) {
            $data['tags'] = $resource->tags->map(fn($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug]);
        }

        if ($detailed && $resource->relationLoaded('reviews')) {
            $visible = $resource->reviews->where('is_visible', true);
            $data['reviews'] = $visible->map(fn($r) => [
                'id'          => $r->id,
                'rating'      => $r->rating,
                'review_text' => $r->review_text,
                'created_at'  => $r->created_at,
                'student'     => ($r->relationLoaded('student') && $r->student) ? [
                    'id'         => $r->student->uuid,
                    'name'       => $r->student->name,
                    'avatar_url' => $r->student->avatar_url,
                ] : null,
            ])->values();
            $data['reviews_count'] = $visible->count();
        }

        return $data;
    }

    private function typeLabel(string $type): string
    {
        return match ($type) {
            'notes'              => 'Notes & Study Guide',
            'practice_questions' => 'Practice Questions',
            'assignment'         => 'Assignment',
            'past_paper'         => 'Past Exam Paper',
            'flashcard_deck'     => 'Flashcard Deck',
            'simulation'         => 'Interactive Simulation',
            'worksheet'          => 'Worksheet',
            default              => ucfirst(str_replace('_', ' ', $type)),
        };
    }

    private function formatFileSize(?int $bytes): string
    {
        if (!$bytes) return 'Unknown';
        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1_048_576) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1_048_576, 1) . ' MB';
    }
}
