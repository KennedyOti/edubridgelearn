<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmailVerificationController extends Controller
{


    public function verify(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.'
            ], 400);
        }

        if (!$user->email_otp || !$user->email_otp_expires_at) {
            return response()->json([
                'success' => false,
                'message' => 'No OTP found. Please request a new one.'
            ], 400);
        }

        if (now()->greaterThan($user->email_otp_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired. Please request a new one.'
            ], 400);
        }

        if (!Hash::check($request->otp, $user->email_otp)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP.'
            ], 400);
        }

        $user->email_verified_at = now();
        $user->email_otp = null;
        $user->email_otp_expires_at = null;

        if ($user->isStudent()) {
            $user->approved_at = now();
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully.'
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified.'], 200);
        }

        $otp = random_int(100000, 999999);

        $user->email_otp = Hash::make($otp);
        $user->email_otp_expires_at = now()->addMinutes(10);
        $user->save();

        $user->notify(new \App\Notifications\EmailOtpNotification($otp));

        return response()->json(['message' => 'OTP resent successfully.'], 200);
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
