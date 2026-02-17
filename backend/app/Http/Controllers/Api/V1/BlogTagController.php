<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;

class BlogTagController extends Controller
{
    public function index()
    {
        return response()->json(BlogTag::all());
    }

    public function show($slug)
    {
        $tag = BlogTag::where('slug', $slug)->firstOrFail();

        $posts = $tag->posts()
            ->published()
            ->paginate(10);

        return response()->json([
            'tag' => $tag,
            'posts' => $posts
        ]);
    }
}
