<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique(); // free, basic, premium, institutional
            $table->text('description')->nullable();
            $table->bigInteger('price_monthly')->default(0); // In cents
            $table->bigInteger('price_yearly')->default(0);
            $table->string('currency', 3)->default('USD');
            $table->integer('ai_queries_per_day')->default(20); // -1 = unlimited
            $table->integer('recorded_lessons_per_month')->default(0); // -1 = unlimited
            $table->integer('live_sessions_per_month')->default(0);
            $table->boolean('includes_all_lessons')->default(false);
            $table->boolean('priority_support')->default(false);
            $table->json('features')->nullable(); // Additional feature flags
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('subscription_plans')->onDelete('restrict');
            $table->enum('status', ['trialing', 'active', 'past_due', 'cancelled', 'expired'])->default('active');
            $table->enum('billing_interval', ['monthly', 'yearly'])->default('monthly');
            $table->enum('gateway', ['stripe', 'paypal', 'manual'])->nullable();
            $table->string('gateway_subscription_id')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
