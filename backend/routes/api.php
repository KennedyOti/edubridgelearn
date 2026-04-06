<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ContributorController;
use App\Http\Controllers\Api\V1\CurriculumController;
use App\Http\Controllers\Api\V1\LessonController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\TutorController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ──────────────────────────────────────────────────────────────────────
    // Public Auth Routes
    // ──────────────────────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        // Social auth
        Route::get('/social/{provider}', [AuthController::class, 'socialRedirect']);
        Route::post('/social/{provider}/callback', [AuthController::class, 'socialCallback']);
    });

    // ──────────────────────────────────────────────────────────────────────
    // Public Curriculum Data (database-driven)
    // ──────────────────────────────────────────────────────────────────────
    Route::prefix('curriculum')->group(function () {
        Route::get('/options', [CurriculumController::class, 'options']);
        Route::get('/subjects/{levelCode}', [CurriculumController::class, 'subjectsByLevel']);
        Route::get('/levels/{levelId}/subjects', [CurriculumController::class, 'subjectsByLevelId']);
        Route::get('/subjects/{subjectId}/topics', [CurriculumController::class, 'topicsBySubject']);
    });

    Route::get('/curricula', [CurriculumController::class, 'index']);

    // Public tutor search & profiles
    Route::get('/tutors/search', [BookingController::class, 'searchTutors']);
    Route::get('/tutors/{tutorUuid}/profile', [BookingController::class, 'getTutorPublicProfile']);

    // Public lesson browsing
    Route::get('/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{uuid}', [LessonController::class, 'show'])->middleware('auth:sanctum')->withoutMiddleware([]);

    // ──────────────────────────────────────────────────────────────────────
    // Public Blog Routes
    // ──────────────────────────────────────────────────────────────────────
    Route::prefix('blogs')->group(function () {
        Route::get('/', [BlogController::class, 'index']);
        Route::get('/categories', [BlogController::class, 'categories']);
        Route::get('/{slug}', [BlogController::class, 'show'])->where('slug', '[a-z0-9-]+');
    });

    // ──────────────────────────────────────────────────────────────────────
    // Authenticated Routes
    // ──────────────────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth management
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
            Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
            Route::post('/2fa/enable', [AuthController::class, 'enable2FA']);
            Route::post('/2fa/disable', [AuthController::class, 'disable2FA']);
            Route::delete('/account', [AuthController::class, 'deleteAccount']);
        });

        // User profile (all authenticated roles)
        Route::get('/users/me', [AuthController::class, 'me']);
        Route::put('/users/me', [AuthController::class, 'updateProfile']);

        // ── Student Routes ────────────────────────────────────────────────
        Route::middleware('role:student')->prefix('students')->group(function () {
            Route::get('/profile', [StudentController::class, 'getProfile']);
            Route::put('/profile', [StudentController::class, 'updateProfile']);
            Route::post('/onboarding', [StudentController::class, 'completeOnboarding']);

            // Student bookings
            Route::get('/bookings', [BookingController::class, 'studentBookings']);

            // Lesson access
            Route::post('/lessons/{uuid}/progress', [LessonController::class, 'updateProgress']);
            Route::post('/lessons/{uuid}/review', [LessonController::class, 'submitReview']);
            Route::post('/lessons/{uuid}/purchase', [LessonController::class, 'purchase']);
        });

        // ── Tutor Routes ──────────────────────────────────────────────────
        Route::middleware('role:tutor')->prefix('tutors')->group(function () {
            Route::get('/profile', [TutorController::class, 'getProfile']);
            Route::put('/profile', [TutorController::class, 'updateProfile']);
            Route::post('/submit-review', [TutorController::class, 'submitForReview']);
            Route::get('/dashboard', [TutorController::class, 'getDashboard']);

            // Tutor bookings
            Route::get('/bookings', [BookingController::class, 'tutorBookings']);
            Route::post('/bookings/{uuid}/complete', [BookingController::class, 'complete']);
            Route::post('/bookings/{uuid}/notes', [BookingController::class, 'addNotes']);

            // Tutor lessons (module 6.4.2)
            Route::get('/lessons', [LessonController::class, 'tutorLessons']);
            Route::post('/lessons', [LessonController::class, 'store']);
            Route::put('/lessons/{uuid}', [LessonController::class, 'update']);
            Route::post('/lessons/{uuid}/publish', [LessonController::class, 'publish']);
            Route::delete('/lessons/{uuid}', [LessonController::class, 'destroy']);
        });

        // ── Contributor Routes ────────────────────────────────────────────
        Route::middleware('role:contributor')->prefix('contributors')->group(function () {
            Route::get('/profile', [ContributorController::class, 'getProfile']);
            Route::put('/profile', [ContributorController::class, 'updateProfile']);
            Route::post('/submit-review', [ContributorController::class, 'submitForReview']);
            Route::get('/dashboard', [ContributorController::class, 'getDashboard']);
        });

        // ── Shared: Bookings (student + tutor) ────────────────────────────
        Route::post('/bookings', [BookingController::class, 'create'])->middleware('role:student');
        Route::get('/bookings/{uuid}', [BookingController::class, 'show'])->middleware('role:student,tutor,admin,super_admin');
        Route::post('/bookings/{uuid}/confirm', [BookingController::class, 'confirm'])->middleware('role:student');
        Route::post('/bookings/{uuid}/cancel', [BookingController::class, 'cancel'])->middleware('role:student,tutor,admin,super_admin');
        Route::post('/bookings/{uuid}/review', [BookingController::class, 'review'])->middleware('role:student');

        // ── Blog Routes (authors: contributor, tutor, admin) ─────────────
        Route::middleware('role:contributor,tutor,admin,super_admin')->prefix('blogs')->group(function () {
            Route::post('/', [BlogController::class, 'store']);
            Route::get('/my-posts', [BlogController::class, 'myPosts']);
            Route::get('/my-posts/{uuid}', [BlogController::class, 'showForEdit']);
            Route::put('/{uuid}', [BlogController::class, 'update']);
            Route::delete('/{uuid}', [BlogController::class, 'destroy']);
            Route::post('/{uuid}/submit', [BlogController::class, 'submit']);
        });

        // Blog comments (any authenticated user)
        Route::post('/blogs/{slug}/comment', [BlogController::class, 'addComment']);

        // ── Admin Routes ──────────────────────────────────────────────────
        Route::middleware('role:admin,super_admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);
            Route::get('/users', [AdminController::class, 'listUsers']);
            Route::get('/approvals', [AdminController::class, 'getPendingApprovals']);
            Route::post('/users/{userId}/status', [AdminController::class, 'updateUserStatus']);

            Route::post('/tutors/{userId}/approve', [AdminController::class, 'approveTutor']);
            Route::post('/tutors/{userId}/reject', [AdminController::class, 'rejectTutor']);

            Route::post('/contributors/{userId}/approve', [AdminController::class, 'approveContributor']);
            Route::post('/contributors/{userId}/reject', [AdminController::class, 'rejectContributor']);

            // Super admin only
            Route::middleware('role:super_admin')->group(function () {
                Route::post('/create-admin', [AdminController::class, 'createAdmin']);
            });

            // Blog moderation
            Route::prefix('blogs')->group(function () {
                Route::get('/', [BlogController::class, 'adminIndex']);
                Route::post('/{uuid}/approve', [BlogController::class, 'approve']);
                Route::post('/{uuid}/reject', [BlogController::class, 'reject']);
                Route::post('/{uuid}/feature', [BlogController::class, 'toggleFeatured']);
                Route::post('/categories', [BlogController::class, 'storeCategory']);
                Route::post('/comments/{id}/approve', [BlogController::class, 'approveComment']);
                Route::delete('/comments/{id}', [BlogController::class, 'deleteComment']);
            });
        });
    });
});
