<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Badges definition table
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon_url')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->enum('criteria_type', [
                'accepted_answers',   // Helpful badge
                'upvotes_received',   // Expert badge
                'answers_given',      // Mentor badge
                'streak_days',        // Streak badge
                'sessions_completed',
                'lessons_completed',
                'quizzes_aced',
                'resources_purchased',
                'first_action',       // Onboarding milestones
            ]);
            $table->integer('criteria_value'); // Threshold to earn
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null'); // Subject-specific badge
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // XP transactions log
        Schema::create('xp_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->enum('action', [
                'lesson_completed',
                'quiz_completed',
                'session_completed',
                'community_post',
                'community_answer',
                'answer_accepted',
                'upvote_received',
                'resource_uploaded',
                'daily_login',
                'streak_bonus',
            ]);
            $table->integer('xp_earned');
            // Polymorphic reference to source (lesson, booking, post, etc.)
            $table->nullableMorphs('reference');
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'subject_id']);
            $table->index('action');
        });

        // User level per subject (progress tracking)
        Schema::create('user_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('cascade');
            $table->string('level_name')->default('Beginner'); // Beginner, Intermediate, Advanced, Master
            $table->integer('level_number')->default(1);
            $table->integer('total_xp')->default(0);
            $table->integer('xp_to_next_level')->default(100);
            $table->timestamps();

            $table->unique(['user_id', 'subject_id']);
            $table->index('user_id');
        });

        // User earned badges
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->constrained('badges')->onDelete('cascade');
            $table->timestamp('earned_at')->useCurrent();

            $table->unique(['user_id', 'badge_id']);
            $table->index('user_id');
        });

        // Learning streaks
        Schema::create('learning_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->integer('current_streak')->default(0); // Days in a row
            $table->integer('longest_streak')->default(0);
            $table->date('last_activity_date')->nullable();
            $table->date('streak_frozen_until')->nullable(); // Power-up: freeze streak
            $table->integer('freeze_count_remaining')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_streaks');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('user_levels');
        Schema::dropIfExists('xp_transactions');
        Schema::dropIfExists('badges');
    }
};
