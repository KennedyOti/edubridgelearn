<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Countries — admin-managed list shown in onboarding
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code', 2)->nullable(); // ISO 3166-1 alpha-2
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('is_active');
        });

        // Schools / institutions — managed list, scoped to a country
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->onDelete('cascade');
            $table->string('name');
            $table->string('city')->nullable();
            $table->string('type')->nullable(); // e.g. Secondary, University, College
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['country_id', 'is_active']);
            $table->unique(['country_id', 'name']);
        });

        // Learning goals — managed list shown in onboarding
        Schema::create('learning_goals', function (Blueprint $table) {
            $table->id();
            $table->string('label')->unique();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
        Schema::dropIfExists('learning_goals');
        Schema::dropIfExists('countries');
    }
};
