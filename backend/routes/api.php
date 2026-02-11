<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Public auth routes (no middleware)
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:auth');  
Route::post('/logout', [LogoutController::class, 'store'])->middleware('auth:sanctum');
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->middleware('auth:sanctum');

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

Route::post('/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:auth');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:auth');
Route::post('/email/resend-unauthenticated', [EmailVerificationController::class, 'resendUnauthenticated'])
    ->middleware('throttle:auth');

// Example protected route (for testing)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
