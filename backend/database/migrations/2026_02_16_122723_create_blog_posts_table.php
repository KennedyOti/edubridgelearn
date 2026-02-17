<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('blog_categories');

            $table->string('title');
            $table->string('slug', 270)->unique();

            $table->text('excerpt')->nullable();
            $table->longText('content');

            $table->string('featured_image', 500)->nullable();

            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('meta_keywords', 500)->nullable();

            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])
                ->default('draft');

            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->integer('reading_time')->nullable();
            $table->integer('views_count')->default(0);

            $table->boolean('allow_comments')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('published_at');
            $table->index('is_featured');
            $table->index('category_id');
            $table->index('user_id');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
