<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flashcard_decks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->onDelete('set null');
            $table->boolean('is_public')->default(false);
            $table->integer('cards_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['creator_id', 'is_public']);
            $table->index('subject_id');
        });

        Schema::create('flashcards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deck_id')->constrained('flashcard_decks')->onDelete('cascade');
            $table->text('front_content'); // Question / Term
            $table->text('back_content'); // Answer / Definition
            $table->string('front_image_url')->nullable();
            $table->string('back_image_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('deck_id');
        });

        // SM-2 spaced repetition review schedule per student per card
        Schema::create('flashcard_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('flashcard_id')->constrained('flashcards')->onDelete('cascade');
            $table->decimal('ease_factor', 4, 2)->default(2.5); // SM-2 EF, min 1.3
            $table->integer('interval_days')->default(1); // Days until next review
            $table->integer('repetitions')->default(0); // Number of successful reviews
            $table->tinyInteger('last_quality')->nullable(); // 0-5 quality rating
            $table->date('due_date'); // Next scheduled review
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'flashcard_id']);
            $table->index(['student_id', 'due_date']);
        });

        // Track which decks students are studying
        Schema::create('student_decks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('deck_id')->constrained('flashcard_decks')->onDelete('cascade');
            $table->integer('cards_learned')->default(0);
            $table->integer('cards_due')->default(0);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('last_studied_at')->nullable();

            $table->unique(['student_id', 'deck_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_decks');
        Schema::dropIfExists('flashcard_reviews');
        Schema::dropIfExists('flashcards');
        Schema::dropIfExists('flashcard_decks');
    }
};
