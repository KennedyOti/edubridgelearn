<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    // Resend verification email
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified.'], 200);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link resent.'], 200);
    }


    public function verify(Request $request, $id, $hash)
    {
        // Validate the signature manually by reconstructing the URL
        $expires = $request->query('expires');
        $signature = $request->query('signature');

        if (!$expires || !$signature) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        // Check if link has expired
        if (now()->timestamp > $expires) {
            return response()->json(['message' => 'Verification link has expired.'], 403);
        }

        // Find the user
        $user = User::findOrFail($id);

        // Validate the hash matches the user's email
        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        // Validate the signature
        $url = url("/api/email/verify/{$id}/{$hash}");
        $queryString = http_build_query([
            'expires' => $expires,
        ]);
        $urlToSign = "{$url}?{$queryString}";

        $expectedSignature = hash_hmac('sha256', $urlToSign, config('app.key'));

        if (!hash_equals($signature, $expectedSignature)) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 403);
        }

        // Check if already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified.'], 200);
        }

        // Mark as verified
        $user->markEmailAsVerified();
        event(new Verified($user));

        // Auto-approve students
        if ($user->isStudent()) {
            $user->approved_at = now();
            $user->save();
        }

        return response()->json(['message' => 'Email verified successfully.'], 200);
    }


    public function resendUnauthenticated(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified.'], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link resent.'], 200);
    }
}
