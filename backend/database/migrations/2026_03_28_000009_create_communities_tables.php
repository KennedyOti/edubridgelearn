<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('education_level_id')->nullable()->constrained('education_levels')->onDelete('set null');
            $table->string('cover_image_url')->nullable();
            $table->integer('member_count')->default(0);
            $table->integer('post_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_private')->default(false);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['subject_id', 'is_active']);
            $table->index('slug');
        });

        Schema::create('community_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained('communities')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['member', 'moderator'])->default('member');
            $table->timestamp('joined_at')->useCurrent();

            $table->unique(['community_id', 'user_id']);
            $table->index('community_id');
            $table->index('user_id');
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('community_id')->constrained('communities')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->longText('body');
            $table->enum('type', ['question', 'discussion', 'announcement'])->default('discussion');
            $table->integer('upvotes')->default(0);
            $table->integer('downvotes')->default(0);
            $table->integer('views_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_hidden')->default(false);
            $table->boolean('has_accepted_answer')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['community_id', 'is_hidden']);
            $table->index(['user_id']);
            $table->index('type');
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade'); // Nested replies
            $table->longText('body');
            $table->integer('upvotes')->default(0);
            $table->boolean('is_expert_answer')->default(false); // Marked by tutor
            $table->boolean('is_accepted_answer')->default(false); // Marked by question author
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['post_id', 'is_hidden']);
            $table->index('user_id');
            $table->index('parent_id');
        });

        Schema::create('post_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('vote', ['up', 'down']);
            $table->timestamps();

            $table->unique(['post_id', 'user_id']);
        });

        Schema::create('comment_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained('comments')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('vote', ['up', 'down']);
            $table->timestamps();

            $table->unique(['comment_id', 'user_id']);
        });

        // Reactions (like, helpful, insightful)
        Schema::create('post_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('reaction', ['like', 'helpful', 'insightful']);
            $table->timestamps();

            $table->unique(['post_id', 'user_id']);
        });

        // User reputation tracking for gamification
        Schema::create('user_reputation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->integer('total_points')->default(0);
            $table->integer('posts_count')->default(0);
            $table->integer('answers_count')->default(0);
            $table->integer('accepted_answers_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reputation');
        Schema::dropIfExists('post_reactions');
        Schema::dropIfExists('comment_votes');
        Schema::dropIfExists('post_votes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('community_members');
        Schema::dropIfExists('communities');
    }
};
