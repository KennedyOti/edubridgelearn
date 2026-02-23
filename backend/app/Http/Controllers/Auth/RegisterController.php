<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:student,tutor,contributor'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Generate 6-digit OTP
        $otp = random_int(100000, 999999);

        $user->email_otp = Hash::make($otp);
        $user->email_otp_expires_at = now()->addMinutes(10);
        $user->save();

        // Send OTP notification
        $user->notify(new \App\Notifications\EmailOtpNotification($otp));

        return response()->json([
            'message' => 'Registered successfully. Please verify using the OTP sent to your email.'
        ], 201);

        // For students, auto-approve after verify (handled in verification)
        if (!$user->isStudent()) {
            // Notify admin for approval (implement later, e.g., queue email)
        }

        return response()->json(['message' => 'Registered successfully. Please verify your email.'], 201);
    }
}
