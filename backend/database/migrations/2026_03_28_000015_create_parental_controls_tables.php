<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_child_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('child_user_id')->constrained('users')->onDelete('cascade');
            $table->string('relationship')->nullable(); // parent, guardian, teacher
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->string('verification_token')->nullable();
            $table->timestamps();

            $table->unique(['parent_user_id', 'child_user_id']);
            $table->index('parent_user_id');
            $table->index('child_user_id');
        });

        Schema::create('spending_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_child_link_id')->constrained('parent_child_links')->onDelete('cascade');
            $table->bigInteger('monthly_limit'); // In cents
            $table->string('currency', 3)->default('USD');
            $table->bigInteger('current_month_spent')->default(0);
            $table->date('reset_date'); // Day of month to reset
            $table->boolean('require_approval')->default(true); // Approve each purchase
            $table->timestamps();

            $table->unique('parent_child_link_id');
        });

        Schema::create('content_filters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_child_link_id')->constrained('parent_child_links')->onDelete('cascade');
            $table->json('restricted_community_ids')->nullable(); // Community IDs blocked
            $table->json('restricted_subject_ids')->nullable(); // Subject IDs for AI teacher
            $table->boolean('disable_community')->default(false);
            $table->boolean('disable_ai_teacher')->default(false);
            $table->boolean('safe_search_only')->default(true);
            $table->timestamps();

            $table->unique('parent_child_link_id');
        });

        // Purchase approvals for parental control
        Schema::create('purchase_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_child_link_id')->constrained('parent_child_links')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            // Polymorphic: booking, resource_purchase, subscription
            $table->morphs('purchasable');
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('USD');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['parent_child_link_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_approvals');
        Schema::dropIfExists('content_filters');
        Schema::dropIfExists('spending_limits');
        Schema::dropIfExists('parent_child_links');
    }
};
