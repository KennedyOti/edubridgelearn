<?php

namespace App\Services;

use App\Models\EmailVerification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class EmailVerificationService
{
    public function sendOtp(User $user): void
    {
        // Invalidate any existing unverified OTPs
        EmailVerification::where('user_id', $user->id)
            ->whereNull('verified_at')
            ->delete();

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerification::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(15),
            'created_at' => now(),
        ]);

        // Send email with OTP
        Mail::to($user->email)->send(new \App\Mail\EmailVerificationOtp($user, $otp));
    }

    public function verifyOtp(User $user, string $otp): bool
    {
        $record = EmailVerification::where('user_id', $user->id)
            ->where('otp', $otp)
            ->whereNull('verified_at')
            ->first();

        if (!$record) {
            return false;
        }

        // Increment attempt counter
        $record->increment('attempts');

        if ($record->hasExceededAttempts()) {
            throw new \Exception('Too many failed attempts. Please request a new OTP.', 429);
        }

        if ($record->isExpired()) {
            throw new \Exception('OTP has expired. Please request a new one.', 410);
        }

        // Mark as verified
        $record->update(['verified_at' => now()]);

        // Mark user email as verified
        $user->update(['email_verified_at' => now()]);

        return true;
    }

    public function resendOtp(User $user): void
    {
        if ($user->email_verified_at) {
            throw new \Exception('Email is already verified.', 400);
        }

        // Rate limit: max once per minute
        $recent = EmailVerification::where('user_id', $user->id)
            ->whereNull('verified_at')
            ->where('created_at', '>=', now()->subMinute())
            ->exists();

        if ($recent) {
            throw new \Exception('Please wait before requesting a new OTP.', 429);
        }

        $this->sendOtp($user);
    }
}
