<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Curricula: CBC, British, American, IB, College, University, Lifelong Learner
        Schema::create('curricula', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // cbc, british, american, ib, college, university, lifelong
            $table->string('country')->nullable(); // e.g. Kenya, Global
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('code');
            $table->index('is_active');
        });

        // Education levels within each curriculum
        Schema::create('education_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curricula')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique(); // e.g. cbc_primary, cbc_junior_secondary, british_gcse
            $table->string('group_label')->nullable(); // e.g. "Kenya CBC", "International"
            $table->integer('level_order')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['curriculum_id', 'is_active']);
            $table->index('code');
        });

        // Grades within education levels
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('education_level_id')->constrained('education_levels')->onDelete('cascade');
            $table->string('name'); // e.g. "Grade 1", "Year 10", "IB Year 1"
            $table->string('code')->nullable(); // e.g. grade_1, year_10
            $table->integer('grade_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('education_level_id');
        });

        // Subjects linked to education levels (a subject can exist across multiple levels)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('education_level_id')->constrained('education_levels')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable(); // e.g. mathematics, english_language
            $table->string('short_name')->nullable();
            $table->text('description')->nullable();
            $table->string('icon_url')->nullable();
            $table->string('color_hex', 7)->nullable(); // for UI theming
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['education_level_id', 'is_active']);
            $table->index('code');
        });

        // Topics within subjects
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['subject_id', 'is_active']);
        });

        // Subtopics within topics
        Schema::create('subtopics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('topics')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['topic_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subtopics');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('education_levels');
        Schema::dropIfExists('curricula');
    }
};
