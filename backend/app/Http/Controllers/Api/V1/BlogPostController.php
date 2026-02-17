<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            $query->whereHas('category', fn ($q) =>
                $q->where('slug', $request->category)
            );
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', fn ($q) =>
                $q->where('slug', $request->tag)
            );
        }

        if ($request->boolean('featured')) {
            $query->featured();
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
                'approvedComments.user'
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
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'category_id' => 'required|exists:blog_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
            'status' => 'nullable|in:draft,pending,published',
        ]);

        $status = $request->status ?? 'draft';

        // Contributors cannot publish directly
        if ($request->user()->role !== 'admin' && $status === 'published') {
            $status = 'pending';
        }

        $post = BlogPost::create([
            'user_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'content' => $request->validated()['content'],
            'excerpt' => $request->excerpt,
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
            'is_featured' => $request->boolean('is_featured'),
            'allow_comments' => $request->boolean('allow_comments', true),
        ]);

        if ($request->tags) {
            $post->tags()->sync($request->tags);
        }

        return response()->json($post->load('tags'), 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Post
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        if (
            $request->user()->role !== 'admin' &&
            $post->user_id !== $request->user()->id
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->update($request->only([
            'title',
            'content',
            'excerpt',
            'category_id',
            'status',
            'is_featured',
            'allow_comments',
            'meta_title',
            'meta_description',
            'meta_keywords'
        ]));

        return response()->json($post);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Post
    |--------------------------------------------------------------------------
    */

    public function destroy(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can delete'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Deleted']);
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
