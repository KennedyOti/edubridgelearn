<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    // ── Public: list published posts ──────────────────────────────────────────

    /**
     * Browse published blog posts.
     * GET /api/v1/blogs
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category' => 'nullable|string',
            'tag'      => 'nullable|string',
            'search'   => 'nullable|string|max:200',
            'featured' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = BlogPost::published()
            ->with(['author:id,uuid,name,avatar_url,role', 'category:id,name,slug,color_hex', 'tags:id,name,slug'])
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at');

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->tag) {
            $query->whereHas('tags', fn($q) => $q->where('slug', $request->tag));
        }

        if ($request->search) {
            $query->where(fn($q) => $q
                ->where('title', 'like', "%{$request->search}%")
                ->orWhere('excerpt', 'like', "%{$request->search}%")
            );
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $posts = $query->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => $posts->map(fn($p) => $this->formatPost($p)),
            'meta' => [
                'total'        => $posts->total(),
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'per_page'     => $posts->perPage(),
            ],
        ]);
    }

    /**
     * Get a single published post by slug. Increments view count.
     * GET /api/v1/blogs/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::where('slug', $slug)
            ->published()
            ->with([
                'author:id,uuid,name,avatar_url,role',
                'category:id,name,slug,color_hex',
                'tags:id,name,slug',
                'comments.author:id,uuid,name,avatar_url',
                'comments.replies.author:id,uuid,name,avatar_url',
            ])
            ->firstOrFail();

        // Increment view count (fire-and-forget)
        $post->increment('views_count');

        return response()->json(['data' => $this->formatPost($post, true)]);
    }

    /**
     * List all active blog categories.
     * GET /api/v1/blogs/categories
     */
    public function categories(): JsonResponse
    {
        $categories = BlogCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->withCount(['posts' => fn($q) => $q->where('status', 'published')])
            ->get();

        return response()->json([
            'data' => $categories->map(fn($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'slug'        => $c->slug,
                'description' => $c->description,
                'color_hex'   => $c->color_hex,
                'posts_count' => $c->posts_count,
            ]),
        ]);
    }

    // ── Authenticated author routes ───────────────────────────────────────────

    /**
     * Create a new blog post (draft by default).
     * POST /api/v1/blogs
     * Roles: contributor, tutor, admin, super_admin
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'               => 'required|string|max:255',
            'body'                => 'required|string',
            'excerpt'             => 'nullable|string|max:500',
            'category_id'         => 'nullable|integer|exists:blog_categories,id',
            'featured_image_url'  => 'nullable|url|max:500',
            'tags'                => 'nullable|array',
            'tags.*'              => 'string|max:50',
            'seo_metadata'        => 'nullable|array',
            'seo_metadata.title'  => 'nullable|string|max:60',
            'seo_metadata.description' => 'nullable|string|max:160',
        ]);

        $user = $request->user();
        $this->authorizeCanWrite($user);

        $slug = $this->uniqueSlug($request->title);
        $readingTime = $this->estimateReadingTime($request->body);

        // Admin posts publish immediately; contributors go to review queue
        $isAdmin = in_array($user->role, ['admin', 'super_admin']);
        $status      = $isAdmin ? 'published' : 'draft';
        $publishedAt = $isAdmin ? now() : null;

        $post = BlogPost::create([
            'author_id'          => $user->id,
            'category_id'        => $request->category_id,
            'title'              => $request->title,
            'slug'               => $slug,
            'excerpt'            => $request->excerpt ?? Str::limit(strip_tags($request->body), 160),
            'body'               => $request->body,
            'featured_image_url' => $request->featured_image_url,
            'status'             => $status,
            'reading_time_minutes' => $readingTime,
            'published_at'       => $publishedAt,
            'seo_metadata'       => $request->seo_metadata,
        ]);

        if ($request->tags) {
            $tagIds = $this->resolveTagIds($request->tags);
            $post->tags()->sync($tagIds);
        }

        $post->load(['author:id,uuid,name,avatar_url,role', 'category:id,name,slug,color_hex', 'tags:id,name,slug']);

        return response()->json([
            'data' => $this->formatPost($post),
            'meta' => ['message' => $isAdmin ? 'Post published.' : 'Post saved as draft.'],
        ], 201);
    }

    /**
     * Update own blog post.
     * PUT /api/v1/blogs/{uuid}
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'title'               => 'sometimes|string|max:255',
            'body'                => 'sometimes|string',
            'excerpt'             => 'nullable|string|max:500',
            'category_id'         => 'nullable|integer|exists:blog_categories,id',
            'featured_image_url'  => 'nullable|url|max:500',
            'tags'                => 'nullable|array',
            'tags.*'              => 'string|max:50',
            'seo_metadata'        => 'nullable|array',
        ]);

        $user = $request->user();
        $post = BlogPost::where('uuid', $uuid)->firstOrFail();

        // Author or admin can edit
        if ($post->author_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['errors' => [['message' => 'Not authorised to edit this post.']]], 403);
        }

        // If post was published, editing moves it back to draft (for non-admin)
        $newStatus = $post->status;
        if ($post->status === 'published' && !in_array($user->role, ['admin', 'super_admin'])) {
            $newStatus = 'draft';
        }

        $updateData = array_filter([
            'category_id'         => $request->category_id,
            'title'               => $request->title,
            'excerpt'             => $request->excerpt,
            'body'                => $request->body,
            'featured_image_url'  => $request->featured_image_url,
            'seo_metadata'        => $request->seo_metadata,
            'status'              => $newStatus,
        ], fn($v) => !is_null($v));

        if ($request->has('title')) {
            $updateData['slug'] = $this->uniqueSlug($request->title, $post->id);
        }

        if ($request->has('body')) {
            $updateData['reading_time_minutes'] = $this->estimateReadingTime($request->body);
            if (empty($request->excerpt)) {
                $updateData['excerpt'] = Str::limit(strip_tags($request->body), 160);
            }
        }

        $post->update($updateData);

        if ($request->has('tags')) {
            $tagIds = $request->tags ? $this->resolveTagIds($request->tags) : [];
            $post->tags()->sync($tagIds);
        }

        $post->load(['author:id,uuid,name,avatar_url,role', 'category:id,name,slug,color_hex', 'tags:id,name,slug']);

        return response()->json([
            'data' => $this->formatPost($post->fresh()),
            'meta' => ['message' => 'Post updated.'],
        ]);
    }

    /**
     * Soft-delete own blog post.
     * DELETE /api/v1/blogs/{uuid}
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $post = BlogPost::where('uuid', $uuid)->firstOrFail();

        if ($post->author_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['errors' => [['message' => 'Not authorised to delete this post.']]], 403);
        }

        $post->delete();

        return response()->json(['meta' => ['message' => 'Post deleted.']]);
    }

    /**
     * Submit a draft post for admin review.
     * POST /api/v1/blogs/{uuid}/submit
     */
    public function submit(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $post = BlogPost::where('uuid', $uuid)->where('author_id', $user->id)->firstOrFail();

        if (!in_array($post->status, ['draft', 'rejected'])) {
            return response()->json(['errors' => [['message' => 'Only draft or rejected posts can be submitted for review.']]], 422);
        }

        if (empty(trim($post->body))) {
            return response()->json(['errors' => [['message' => 'Post body cannot be empty.']]], 422);
        }

        $post->update(['status' => 'pending_review', 'rejection_reason' => null]);

        return response()->json(['meta' => ['message' => 'Post submitted for review.']]);
    }

    /**
     * List the authenticated user's own posts (all statuses).
     * GET /api/v1/blogs/my-posts
     */
    public function myPosts(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => 'nullable|in:draft,pending_review,published,unpublished,rejected',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = BlogPost::where('author_id', $request->user()->id)
            ->with(['category:id,name,slug,color_hex', 'tags:id,name,slug'])
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $posts = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'data' => $posts->map(fn($p) => $this->formatPost($p)),
            'meta' => [
                'total'        => $posts->total(),
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
            ],
        ]);
    }

    /**
     * Get a single post by UUID for editing (author only, returns body + seo_metadata).
     * GET /api/v1/blogs/my-posts/{uuid}
     */
    public function showForEdit(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $post = BlogPost::where('uuid', $uuid)
            ->where('author_id', $user->id)
            ->with(['category:id,name,slug,color_hex', 'tags:id,name,slug'])
            ->firstOrFail();

        return response()->json(['data' => $this->formatPost($post, true)]);
    }

    /**
     * Add a comment to a published post.
     * POST /api/v1/blogs/{slug}/comment
     */
    public function addComment(Request $request, string $slug): JsonResponse
    {
        $request->validate([
            'body'      => 'required|string|max:2000',
            'parent_id' => 'nullable|integer|exists:blog_comments,id',
        ]);

        $post = BlogPost::where('slug', $slug)->published()->firstOrFail();

        // Validate parent belongs to this post
        if ($request->parent_id) {
            $parent = BlogComment::where('id', $request->parent_id)
                ->where('blog_post_id', $post->id)
                ->first();
            if (!$parent) {
                return response()->json(['errors' => [['message' => 'Invalid parent comment.']]], 422);
            }
        }

        $isAdmin = in_array($request->user()->role, ['admin', 'super_admin', 'moderator']);

        $comment = BlogComment::create([
            'blog_post_id' => $post->id,
            'user_id'      => $request->user()->id,
            'parent_id'    => $request->parent_id,
            'body'         => $request->body,
            'is_approved'  => $isAdmin, // auto-approve admin/moderator comments
        ]);

        $comment->load('author:id,uuid,name,avatar_url');

        return response()->json([
            'data' => $this->formatComment($comment),
            'meta' => ['message' => $isAdmin ? 'Comment posted.' : 'Comment submitted for moderation.'],
        ], 201);
    }

    // ── Admin routes ──────────────────────────────────────────────────────────

    /**
     * Admin: list all posts (all statuses) for moderation.
     * GET /api/v1/admin/blogs
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => 'nullable|in:draft,pending_review,published,unpublished,rejected',
            'per_page' => 'nullable|integer|min:1|max:50',
            'search'   => 'nullable|string|max:200',
        ]);

        $query = BlogPost::withTrashed()
            ->with(['author:id,uuid,name,avatar_url,role', 'category:id,name,slug'])
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $posts = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $posts->map(fn($p) => $this->formatPost($p)),
            'meta' => [
                'total'        => $posts->total(),
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
            ],
        ]);
    }

    /**
     * Admin: approve a pending post.
     * POST /api/v1/admin/blogs/{uuid}/approve
     */
    public function approve(string $uuid): JsonResponse
    {
        $post = BlogPost::where('uuid', $uuid)->firstOrFail();

        if ($post->status !== 'pending_review') {
            return response()->json(['errors' => [['message' => 'Only posts pending review can be approved.']]], 422);
        }

        $post->update([
            'status'       => 'published',
            'published_at' => $post->published_at ?? now(),
            'rejection_reason' => null,
        ]);

        return response()->json(['meta' => ['message' => 'Post approved and published.']]);
    }

    /**
     * Admin: reject a pending post with a reason.
     * POST /api/v1/admin/blogs/{uuid}/reject
     */
    public function reject(Request $request, string $uuid): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:1000']);

        $post = BlogPost::where('uuid', $uuid)->firstOrFail();

        if ($post->status !== 'pending_review') {
            return response()->json(['errors' => [['message' => 'Only posts pending review can be rejected.']]], 422);
        }

        $post->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return response()->json(['meta' => ['message' => 'Post rejected.']]);
    }

    /**
     * Admin: toggle featured status.
     * POST /api/v1/admin/blogs/{uuid}/feature
     */
    public function toggleFeatured(string $uuid): JsonResponse
    {
        $post = BlogPost::where('uuid', $uuid)->firstOrFail();
        $post->update(['is_featured' => !$post->is_featured]);

        return response()->json([
            'meta' => ['message' => $post->is_featured ? 'Post featured.' : 'Post unfeatured.'],
        ]);
    }

    /**
     * Admin: approve a comment.
     * POST /api/v1/admin/blogs/comments/{id}/approve
     */
    public function approveComment(int $id): JsonResponse
    {
        $comment = BlogComment::findOrFail($id);
        $comment->update(['is_approved' => true, 'is_spam' => false]);

        return response()->json(['meta' => ['message' => 'Comment approved.']]);
    }

    /**
     * Admin: mark comment as spam/delete.
     * DELETE /api/v1/admin/blogs/comments/{id}
     */
    public function deleteComment(int $id): JsonResponse
    {
        $comment = BlogComment::findOrFail($id);
        $comment->update(['is_spam' => true]);
        $comment->delete();

        return response()->json(['meta' => ['message' => 'Comment removed.']]);
    }

    /**
     * Admin: create a blog category.
     * POST /api/v1/admin/blogs/categories
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $request->validate([
            'name'      => 'required|string|max:100|unique:blog_categories,name',
            'description' => 'nullable|string|max:500',
            'color_hex'   => 'nullable|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $category = BlogCategory::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
            'color_hex'   => $request->color_hex ?? '#4F46E5',
            'sort_order'  => $request->sort_order ?? 0,
        ]);

        return response()->json(['data' => $category, 'meta' => ['message' => 'Category created.']], 201);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function authorizeCanWrite(object $user): void
    {
        $allowed = ['contributor', 'tutor', 'admin', 'super_admin'];
        if (!in_array($user->role, $allowed)) {
            abort(403, 'Only contributors, tutors, and admins can write blog posts.');
        }
    }

    private function uniqueSlug(string $title, ?int $exceptId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        while (
            BlogPost::where('slug', $slug)
                ->when($exceptId, fn($q) => $q->where('id', '!=', $exceptId))
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function estimateReadingTime(string $body): int
    {
        $wordCount = str_word_count(strip_tags($body));
        return max(1, (int) ceil($wordCount / 200)); // 200 wpm average
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

    private function formatPost(BlogPost $post, bool $detailed = false): array
    {
        $data = [
            'id'                   => $post->uuid,
            'title'                => $post->title,
            'slug'                 => $post->slug,
            'excerpt'              => $post->excerpt,
            'featured_image_url'   => $post->featured_image_url,
            'status'               => $post->status,
            'rejection_reason'     => $post->rejection_reason,
            'reading_time_minutes' => $post->reading_time_minutes,
            'views_count'          => $post->views_count,
            'is_featured'          => $post->is_featured,
            'published_at'         => $post->published_at,
            'created_at'           => $post->created_at,
            'updated_at'           => $post->updated_at,
            'deleted_at'           => $post->deleted_at,
        ];

        if ($post->relationLoaded('author') && $post->author) {
            $data['author'] = [
                'id'         => $post->author->uuid,
                'name'       => $post->author->name,
                'avatar_url' => $post->author->avatar_url,
                'role'       => $post->author->role,
            ];
        }

        if ($post->relationLoaded('category') && $post->category) {
            $data['category'] = [
                'id'        => $post->category->id,
                'name'      => $post->category->name,
                'slug'      => $post->category->slug,
                'color_hex' => $post->category->color_hex,
            ];
        }

        if ($post->relationLoaded('tags')) {
            $data['tags'] = $post->tags->map(fn($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug]);
        }

        if ($detailed) {
            $data['body'] = $post->body;
            $data['seo_metadata'] = $post->seo_metadata;

            if ($post->relationLoaded('comments')) {
                $data['comments'] = $post->comments->map(fn($c) => $this->formatComment($c, true));
                $data['comments_count'] = $post->comments->count();
            }
        }

        return $data;
    }

    private function formatComment(BlogComment $comment, bool $withReplies = false): array
    {
        $data = [
            'id'          => $comment->id,
            'body'        => $comment->body,
            'is_approved' => $comment->is_approved,
            'created_at'  => $comment->created_at,
        ];

        if ($comment->relationLoaded('author') && $comment->author) {
            $data['author'] = [
                'id'         => $comment->author->uuid,
                'name'       => $comment->author->name,
                'avatar_url' => $comment->author->avatar_url,
            ];
        }

        if ($withReplies && $comment->relationLoaded('replies')) {
            $data['replies'] = $comment->replies
                ->where('is_approved', true)
                ->map(fn($r) => $this->formatComment($r));
        }

        return $data;
    }
}
