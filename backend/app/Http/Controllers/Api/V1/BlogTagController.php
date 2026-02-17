<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogTagController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Public
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        return response()->json(
            BlogTag::orderBy('name')->get()
        );
    }

    public function show($slug)
    {
        $tag = BlogTag::where('slug', $slug)->firstOrFail();

        $posts = $tag->posts()
            ->published()
            ->latest('published_at')
            ->paginate(10);

        return response()->json([
            'tag' => $tag,
            'posts' => $posts
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:blog_tags,name'
        ]);

        $slug = $this->generateUniqueSlug($request->name);

        $tag = BlogTag::create([
            'name' => $request->name,
            'slug' => $slug
        ]);

        return response()->json([
            'message' => 'Tag created successfully',
            'data' => $tag
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tag = BlogTag::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100|unique:blog_tags,name,' . $id
        ]);

        $slug = $this->generateUniqueSlug($request->name, $id);

        $tag->update([
            'name' => $request->name,
            'slug' => $slug
        ]);

        return response()->json([
            'message' => 'Tag updated successfully',
            'data' => $tag
        ]);
    }

    public function destroy($id)
    {
        $tag = BlogTag::findOrFail($id);
        $tag->delete();

        return response()->json([
            'message' => 'Tag deleted successfully'
        ]);
    }

    private function generateUniqueSlug($name, $ignoreId = null)
    {
        $slug = Str::slug($name);
        $original = $slug;
        $count = 1;

        while (
            BlogTag::where('slug', $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $original . '-' . $count++;
        }

        return $slug;
    }
}
