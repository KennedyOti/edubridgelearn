<?php

use App\Http\Controllers\Api\V1\BlogCategoryController;
use App\Http\Controllers\Api\V1\BlogCommentController;
use App\Http\Controllers\Api\V1\BlogPostController;
use App\Http\Controllers\Api\V1\BlogTagController;
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



Route::prefix('v1/blog')->group(function () {

    Route::get('/posts', [BlogPostController::class, 'index']);
    Route::get('/posts/{slug}', [BlogPostController::class, 'show']);

    Route::get('/categories', [BlogCategoryController::class, 'index']);
    Route::get('/categories/{slug}', [BlogCategoryController::class, 'show']);

    Route::get('/tags', [BlogTagController::class, 'index']);
    Route::get('/tags/{slug}', [BlogTagController::class, 'show']);

    Route::post('/comments', [BlogCommentController::class, 'store']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/posts', [BlogPostController::class, 'store']);
        Route::put('/posts/{id}', [BlogPostController::class, 'update']);
        Route::delete('/posts/{id}', [BlogPostController::class, 'destroy']);

        Route::patch('/comments/{id}/approve', [BlogCommentController::class, 'approve']);
        Route::patch('/comments/{id}/reject', [BlogCommentController::class, 'reject']);
    });
});



