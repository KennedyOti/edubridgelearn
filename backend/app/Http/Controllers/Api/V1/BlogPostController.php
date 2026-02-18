<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogView;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Public Listing
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = BlogPost::with(['author:id,name', 'category', 'tags'])
            ->published();

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        return response()->json(
            $query->latest('published_at')->paginate(10)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Single Post
    |--------------------------------------------------------------------------
    */

    public function show(Request $request, $slug)
    {
        $post = BlogPost::with([
                'author:id,name',
                'category',
                'tags',
                'approvedComments.user:id,name'
            ])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $this->trackView($request, $post);

        return response()->json($post);
    }

    /*
    |--------------------------------------------------------------------------
    | Store Post
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'category_id' => 'required|exists:blog_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
            'status' => 'nullable|in:draft,pending,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'allow_comments' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $status = $validated['status'] ?? 'draft';

        // Only admin can publish directly
        if (!$user->isAdmin() && $status === 'published') {
            $status = 'pending';
        }

        $post = BlogPost::create([
            'user_id' => $user->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
            'is_featured' => $user->isAdmin() ? ($validated['is_featured'] ?? false) : false,
            'allow_comments' => $validated['allow_comments'] ?? true,
            'views_count' => 0,
        ]);

        if (!empty($validated['tags'])) {
            $post->tags()->sync($validated['tags']);
        }

        return response()->json(
            $post->load(['author:id,name', 'category', 'tags']),
            201
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Post
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin() && $post->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'excerpt' => 'nullable|string',
            'category_id' => 'sometimes|exists:blog_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
            'status' => 'nullable|in:draft,pending,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'allow_comments' => 'nullable|boolean',
        ]);

        // Handle status update safely
        if (isset($validated['status'])) {
            if (!$user->isAdmin() && $validated['status'] === 'published') {
                $validated['status'] = 'pending';
            }

            if ($validated['status'] === 'published' && !$post->published_at) {
                $validated['published_at'] = now();
            }
        }

        // Only admin can change featured flag
        if (!$user->isAdmin()) {
            unset($validated['is_featured']);
        }

        $post->update($validated);

        if (array_key_exists('tags', $validated)) {
            $post->tags()->sync($validated['tags'] ?? []);
        }

        return response()->json(
            $post->load(['author:id,name', 'category', 'tags'])
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Post (Admin Only)
    |--------------------------------------------------------------------------
    */

    public function destroy(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Only admin can delete posts'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    /*
    |--------------------------------------------------------------------------
    | View Tracking (Unique Per IP Per Day)
    |--------------------------------------------------------------------------
    */

    private function trackView(Request $request, BlogPost $post)
    {
        $exists = BlogView::where('blog_post_id', $post->id)
            ->where('ip_address', $request->ip())
            ->whereDate('created_at', today())
            ->exists();

        if (!$exists) {
            BlogView::create([
                'blog_post_id' => $post->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => $request->user()?->id,
            ]);

            $post->increment('views_count');
        }
    }
}
