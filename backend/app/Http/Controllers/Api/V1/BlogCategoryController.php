<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;

class BlogCategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            BlogCategory::where('is_active', true)->get()
        );
    }

    public function show($slug)
    {
        $category = BlogCategory::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $posts = $category->posts()
            ->published()
            ->paginate(10);

        return response()->json([
            'category' => $category,
            'posts' => $posts
        ]);
    }
}
