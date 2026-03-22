<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status === 'pending_approval') {
            return response()->json([
                'errors' => [['message' => 'Your account is pending approval.']],
            ], 403);
        }

        if ($user && $user->status === 'suspended') {
            return response()->json([
                'errors' => [['message' => 'Your account has been suspended.']],
            ], 403);
        }

        return $next($request);
    }
}
