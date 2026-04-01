<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Normalized tutor qualifications (replaces JSON column)
        Schema::create('tutor_qualifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_profile_id')->constrained('tutor_profiles')->onDelete('cascade');
            $table->string('title'); // e.g. Bachelor of Education
            $table->string('institution');
            $table->year('year')->nullable();
            $table->string('certificate_url')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index('tutor_profile_id');
        });

        // Structured tutor weekly availability slots
        Schema::create('tutor_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_profile_id')->constrained('tutor_profiles')->onDelete('cascade');
            $table->tinyInteger('day_of_week'); // 0=Sunday, 1=Monday, ... 6=Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->string('timezone')->default('UTC');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tutor_profile_id', 'day_of_week']);
        });

        // Tutor subjects pivot (tutor can teach specific subjects at specific levels)
        Schema::create('tutor_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_profile_id')->constrained('tutor_profiles')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('education_level_id')->constrained('education_levels')->onDelete('cascade');
            $table->decimal('hourly_rate_override', 10, 2)->nullable(); // Override default rate for this subject
            $table->string('currency', 3)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tutor_profile_id', 'subject_id', 'education_level_id'], 'tutor_subject_level_unique');
            $table->index('tutor_profile_id');
            $table->index('subject_id');
        });

        // Student profile subjects pivot (subjects student is enrolled/interested in)
        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_profile_id')->constrained('student_profiles')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->boolean('is_primary')->default(false); // Primary vs secondary interest
            $table->timestamps();

            $table->unique(['student_profile_id', 'subject_id']);
            $table->index('student_profile_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_subjects');
        Schema::dropIfExists('tutor_subjects');
        Schema::dropIfExists('tutor_availability');
        Schema::dropIfExists('tutor_qualifications');
    }
};
