<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tutor_id')->constrained('users')->onDelete('restrict');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();
            // Original upload
            $table->string('original_video_url')->nullable();
            // Transcoded versions (populated after processing)
            $table->string('video_url_360p')->nullable();
            $table->string('video_url_720p')->nullable();
            $table->string('video_url_1080p')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->bigInteger('file_size_bytes')->nullable();
            // Taxonomy
            $table->foreignId('curriculum_id')->nullable()->constrained('curricula')->onDelete('set null');
            $table->foreignId('education_level_id')->nullable()->constrained('education_levels')->onDelete('set null');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->onDelete('set null');
            $table->foreignId('subtopic_id')->nullable()->constrained('subtopics')->onDelete('set null');
            // Pricing
            $table->enum('access_type', ['free', 'purchase', 'subscription'])->default('free');
            $table->bigInteger('price')->default(0); // In cents
            $table->string('currency', 3)->default('USD');
            // Status pipeline
            $table->enum('status', ['uploading', 'processing', 'pending_review', 'published', 'unpublished', 'rejected'])->default('uploading');
            $table->enum('transcoding_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->boolean('allows_download')->default(false);
            $table->text('rejection_reason')->nullable();
            $table->integer('views_count')->default(0);
            $table->integer('purchases_count')->default(0);
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tutor_id', 'status']);
            $table->index(['subject_id', 'status']);
            $table->index(['education_level_id', 'status']);
            $table->index('status');
            $table->index('access_type');
        });

        // Chapters/sections within a lesson for navigation
        Schema::create('lesson_chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->string('title');
            $table->integer('start_second'); // Start time in seconds
            $table->integer('end_second')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('lesson_id');
        });

        // Subtitles/captions for lessons
        Schema::create('lesson_subtitles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->string('language', 10); // e.g. en, sw, fr
            $table->string('file_url');
            $table->boolean('is_auto_generated')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['lesson_id', 'language']);
        });

        // Student progress on lessons
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->integer('watched_seconds')->default(0);
            $table->integer('last_position_seconds')->default(0); // Resume point
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_watched_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'lesson_id']);
            $table->index('student_id');
            $table->index('lesson_id');
        });

        // Student reviews on lessons
        Schema::create('lesson_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('rating'); // 1-5
            $table->text('review_text')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->unique(['lesson_id', 'student_id']);
            $table->index('lesson_id');
        });

        // Lesson purchases (for paid lessons)
        Schema::create('lesson_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('restrict');
            $table->foreignId('payment_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->bigInteger('amount_paid');
            $table->string('currency', 3)->default('USD');
            $table->timestamp('purchased_at')->useCurrent();

            $table->unique(['student_id', 'lesson_id']);
            $table->index('student_id');
            $table->index('lesson_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_purchases');
        Schema::dropIfExists('lesson_reviews');
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('lesson_subtitles');
        Schema::dropIfExists('lesson_chapters');
        Schema::dropIfExists('lessons');
    }
};
