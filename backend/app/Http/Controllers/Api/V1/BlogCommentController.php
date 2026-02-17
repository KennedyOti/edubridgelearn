<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogComment;
use Illuminate\Http\Request;

class BlogCommentController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Store Comment (Guest or Authenticated)
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $request->validate([
            'blog_post_id' => 'required|exists:blog_posts,id',
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:blog_comments,id',
            'guest_name' => 'required_without:user_id|string|max:150',
            'guest_email' => 'required_without:user_id|email|max:150',
        ]);

        $comment = BlogComment::create([
    'blog_post_id' => $request->blog_post_id,
    'user_id' => auth()->id(),
    'parent_id' => $request->parent_id,
    'guest_name' => $request->guest_name,
    'guest_email' => $request->guest_email,
    'content' => $request->validated()['content'],
    'status' => 'pending'
]);


        return response()->json($comment, 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Approve Comment (Admin Only)
    |--------------------------------------------------------------------------
    */

    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = BlogComment::findOrFail($id);
        $comment->update(['status' => 'approved']);

        return response()->json(['message' => 'Comment approved']);
    }

    /*
    |--------------------------------------------------------------------------
    | Reject Comment
    |--------------------------------------------------------------------------
    */

    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = BlogComment::findOrFail($id);
        $comment->update(['status' => 'rejected']);

        return response()->json(['message' => 'Comment rejected']);
    }
}
