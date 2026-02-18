<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogCategoryController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Public Endpoints
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $categories = BlogCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function show($slug)
    {
        $category = BlogCategory::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $posts = $category->posts()
            ->published()
            ->latest('published_at')
            ->paginate(10);

        return response()->json([
            'category' => $category,
            'posts' => $posts
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Endpoints
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150|unique:blog_categories,name',
            'description' => 'nullable|string'
        ]);

        $slug = $this->generateUniqueSlug($request->name);

        $category = BlogCategory::create([
            'name' => $request->input('name'),
            'slug' => $slug,
            'description' => $request->input('description'),
            'is_active' => true
        ]);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = BlogCategory::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:150|unique:blog_categories,name,' . $id,
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $slug = $this->generateUniqueSlug($request->name, $id);

        $category->update([
            'name' => $request->input('name'),
            'slug' => $slug,
            'description' => $request->input('description'),
            'is_active' => $request->input('is_active', true)
        ]);

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = BlogCategory::findOrFail($id);

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    private function generateUniqueSlug($name, $ignoreId = null)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (
            BlogCategory::where('slug', $slug)
                ->when($ignoreId, function ($query) use ($ignoreId) {
                    return $query->where('id', '!=', $ignoreId);
                })
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }
}
