<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->after('id');
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', ['student', 'tutor', 'contributor', 'moderator', 'admin', 'super_admin'])->default('student')->after('phone');
            $table->enum('status', ['active', 'pending_approval', 'suspended', 'deactivated'])->default('active')->after('role');
            $table->string('country')->nullable()->after('status');
            $table->string('timezone')->default('UTC')->after('country');
            $table->string('avatar_url')->nullable()->after('timezone');
            $table->string('google_id')->nullable()->after('avatar_url');
            $table->string('apple_id')->nullable()->after('google_id');
            $table->string('github_id')->nullable()->after('apple_id');
            $table->text('two_factor_secret')->nullable()->after('github_id');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->boolean('two_factor_enabled')->default(false)->after('two_factor_recovery_codes');
            $table->integer('failed_login_attempts')->default(0)->after('two_factor_enabled');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            $table->timestamp('last_login_at')->nullable()->after('locked_until');
            $table->softDeletes();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('education_level', [
                'cbc_primary', 'cbc_junior_secondary', 'cbc_senior_secondary',
                'british', 'american', 'ib',
                'college', 'university', 'lifelong_learner'
            ])->nullable();
            $table->string('curriculum')->nullable();
            $table->string('grade')->nullable();
            $table->string('institution')->nullable();
            $table->json('subjects')->nullable();
            $table->json('learning_goals')->nullable();
            $table->json('preferred_schedule')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->timestamps();
        });

        Schema::create('tutor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->json('qualifications')->nullable();
            $table->integer('experience_years')->nullable();
            $table->json('subjects')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->string('rate_currency', 3)->default('USD');
            $table->string('intro_video_url')->nullable();
            $table->text('teaching_methodology')->nullable();
            $table->enum('verification_status', ['pending', 'approved', 'rejected', 'revision_requested'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('next_reverification_at')->nullable();
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->integer('total_sessions')->default(0);
            $table->json('availability')->nullable();
            $table->timestamps();
        });

        Schema::create('contributor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->json('expertise_areas')->nullable();
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->integer('total_resources')->default(0);
            $table->timestamps();
        });

        Schema::create('auth_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('email')->nullable();
            $table->enum('event', ['login', 'logout', 'failed_login', 'register', 'password_reset', 'account_locked', 'account_deleted', '2fa_enabled', '2fa_disabled', 'social_login']);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('login_rate_limits', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->integer('attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamps();
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_rate_limits');
        Schema::dropIfExists('auth_logs');
        Schema::dropIfExists('contributor_profiles');
        Schema::dropIfExists('tutor_profiles');
        Schema::dropIfExists('student_profiles');

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn([
                'uuid', 'phone', 'role', 'status', 'country', 'timezone',
                'avatar_url', 'google_id', 'apple_id', 'github_id',
                'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_enabled',
                'failed_login_attempts', 'locked_until', 'last_login_at',
            ]);
        });
    }
};
