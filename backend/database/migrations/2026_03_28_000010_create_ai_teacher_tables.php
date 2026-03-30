<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->onDelete('set null');
            $table->string('title')->nullable(); // Auto-generated from first message
            $table->integer('messages_count')->default(0);
            $table->integer('total_tokens_used')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->index(['student_id', 'is_archived']);
            $table->index('subject_id');
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('ai_chat_sessions')->onDelete('cascade');
            $table->enum('role', ['user', 'assistant', 'system']);
            $table->longText('content');
            $table->integer('tokens_used')->default(0);
            $table->string('model_used')->nullable(); // e.g. gpt-4, claude-3
            $table->boolean('is_flagged')->default(false);
            $table->string('flag_reason')->nullable();
            $table->json('metadata')->nullable(); // Additional data (quiz results, etc.)
            $table->timestamp('created_at')->useCurrent();

            $table->index('session_id');
            $table->index('is_flagged');
        });

        // Daily usage tracking per user
        Schema::create('ai_usage_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('queries_used')->default(0);
            $table->integer('tokens_used')->default(0);
            $table->integer('quota_limit')->default(20); // Queries allowed per day
            $table->timestamps();

            $table->unique(['user_id', 'date']);
            $table->index('date');
        });

        // Pre-generated offline content for AI fallback
        Schema::create('ai_offline_content', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->onDelete('set null');
            $table->string('education_level')->nullable();
            $table->enum('content_type', ['explanation', 'example', 'quiz', 'summary']);
            $table->text('prompt'); // The question/prompt this answers
            $table->longText('content'); // Pre-generated response
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['subject_id', 'content_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_offline_content');
        Schema::dropIfExists('ai_usage_tracking');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_chat_sessions');
    }
};
