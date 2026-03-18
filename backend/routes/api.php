<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\TutorController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        // Social auth
        Route::get('/social/{provider}', [AuthController::class, 'socialRedirect']);
        Route::post('/social/{provider}/callback', [AuthController::class, 'socialCallback']);
    });

    // Public curriculum data
    Route::get('/curriculum/options', [StudentController::class, 'getCurriculumOptions']);
    Route::get('/curriculum/subjects/{level}', [StudentController::class, 'getSubjectsByLevel']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        // Auth management
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::post('/2fa/enable', [AuthController::class, 'enable2FA']);
            Route::post('/2fa/disable', [AuthController::class, 'disable2FA']);
            Route::delete('/account', [AuthController::class, 'deleteAccount']);
        });

        // User profile
        Route::get('/users/me', [AuthController::class, 'me']);
        Route::put('/users/me', [AuthController::class, 'updateProfile']);

        // Student routes
        Route::middleware('role:student')->prefix('students')->group(function () {
            Route::get('/profile', [StudentController::class, 'getProfile']);
            Route::put('/profile', [StudentController::class, 'updateProfile']);
            Route::post('/onboarding', [StudentController::class, 'completeOnboarding']);
        });

        // Tutor routes
        Route::middleware('role:tutor')->prefix('tutors')->group(function () {
            Route::get('/profile', [TutorController::class, 'getProfile']);
            Route::put('/profile', [TutorController::class, 'updateProfile']);
            Route::post('/submit-review', [TutorController::class, 'submitForReview']);
            Route::get('/dashboard', [TutorController::class, 'getDashboard']);
        });
    });
});
