<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Global tags (shared across resources, blog posts, etc.)
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();

            $table->index('slug');
        });

        // Marketplace resources
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('creator_id')->constrained('users')->onDelete('restrict');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'notes',
                'practice_questions',
                'assignment',
                'past_paper',
                'flashcard_deck',
                'simulation',
                'worksheet',
            ]);
            $table->string('file_url')->nullable();
            $table->string('preview_url')->nullable(); // First page/excerpt
            $table->bigInteger('file_size_bytes')->nullable();
            $table->string('file_mime_type')->nullable();
            // Taxonomy
            $table->foreignId('curriculum_id')->nullable()->constrained('curricula')->onDelete('set null');
            $table->foreignId('education_level_id')->nullable()->constrained('education_levels')->onDelete('set null');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->onDelete('set null');
            $table->foreignId('subtopic_id')->nullable()->constrained('subtopics')->onDelete('set null');
            // For past papers
            $table->year('exam_year')->nullable();
            $table->string('examining_body')->nullable(); // KNEC, Cambridge, etc.
            // Pricing
            $table->enum('access_type', ['free', 'purchase', 'subscription'])->default('free');
            $table->bigInteger('price')->default(0);
            $table->string('currency', 3)->default('USD');
            // Status
            $table->enum('status', ['draft', 'pending_review', 'published', 'rejected', 'unlisted'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->integer('downloads_count')->default(0);
            $table->integer('purchases_count')->default(0);
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->integer('version')->default(1);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['creator_id', 'status']);
            $table->index(['subject_id', 'status']);
            $table->index(['education_level_id', 'status']);
            $table->index('status');
            $table->index('type');
        });

        // Resource <-> Tag pivot
        Schema::create('resource_tags', function (Blueprint $table) {
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
            $table->foreignId('tag_id')->constrained('tags')->onDelete('cascade');
            $table->primary(['resource_id', 'tag_id']);
        });

        // Resource purchases
        Schema::create('resource_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('resource_id')->constrained('resources')->onDelete('restrict');
            $table->foreignId('payment_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->bigInteger('amount_paid');
            $table->string('currency', 3)->default('USD');
            $table->integer('download_count')->default(0);
            $table->timestamp('purchased_at')->useCurrent();

            $table->unique(['student_id', 'resource_id']);
            $table->index('student_id');
            $table->index('resource_id');
        });

        // Resource reviews
        Schema::create('resource_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('rating'); // 1-5
            $table->text('review_text')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->unique(['resource_id', 'student_id']);
            $table->index('resource_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_reviews');
        Schema::dropIfExists('resource_purchases');
        Schema::dropIfExists('resource_tags');
        Schema::dropIfExists('resources');
        Schema::dropIfExists('tags');
    }
};
