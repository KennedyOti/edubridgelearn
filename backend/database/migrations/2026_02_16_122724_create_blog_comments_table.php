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
        Schema::create('blog_comments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('parent_id')->nullable()
                ->constrained('blog_comments')
                ->cascadeOnDelete();

            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();

            $table->text('content');

            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending');

            $table->boolean('is_edited')->default(false);

            $table->softDeletes();
            $table->timestamps();

            $table->index('blog_post_id');
            $table->index('status');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_comments');
    }
};
