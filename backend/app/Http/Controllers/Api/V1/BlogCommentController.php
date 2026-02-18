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
        $validated = $request->validate([
            'blog_post_id' => 'required|exists:blog_posts,id',
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:blog_comments,id',
            'guest_name' => 'required_without:auth|string|max:150',
            'guest_email' => 'required_without:auth|email|max:150',
        ]);

        $user = $request->user();

        $comment = BlogComment::create([
            'blog_post_id' => $validated['blog_post_id'],
            'user_id'      => $user ? $user->id : null,
            'parent_id'    => $validated['parent_id'] ?? null,
            'guest_name'   => $user ? null : $validated['guest_name'],
            'guest_email'  => $user ? null : $validated['guest_email'],
            'content'      => $validated['content'],
            'status'       => 'pending',
            'is_edited'    => false,
        ]);

        return response()->json([
            'message' => 'Comment submitted successfully. Awaiting approval.',
            'data'    => $comment
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Approve Comment (Admin Only)
    |--------------------------------------------------------------------------
    */

    public function approve(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = BlogComment::findOrFail($id);
        $comment->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Comment approved successfully',
            'data' => $comment
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Reject Comment (Admin Only)
    |--------------------------------------------------------------------------
    */

    public function reject(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = BlogComment::findOrFail($id);
        $comment->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Comment rejected successfully',
            'data' => $comment
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Comment (Owner or Admin)
    |--------------------------------------------------------------------------
    */

    public function destroy(Request $request, $id)
    {
        $comment = BlogComment::findOrFail($id);

        if (
            !$request->user() ||
            (
                !$request->user()->isAdmin() &&
                $comment->user_id !== $request->user()->id
            )
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully'
        ]);
    }
}
