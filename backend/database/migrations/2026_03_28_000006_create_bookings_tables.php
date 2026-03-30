<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('student_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->onDelete('set null');
            $table->timestamp('scheduled_at');
            $table->integer('duration_minutes')->default(60);
            $table->enum('status', [
                'pending',       // Created, awaiting payment
                'confirmed',     // Payment received
                'in_progress',   // Session started
                'completed',     // Session done, awaiting review
                'cancelled',     // Cancelled by student or tutor
                'no_show',       // Student didn't show
                'disputed',      // Under dispute
            ])->default('pending');
            $table->string('meeting_url')->nullable();
            $table->enum('meeting_platform', ['jitsi', 'zoom', 'webrtc'])->default('jitsi');
            $table->bigInteger('price'); // In cents
            $table->string('currency', 3)->default('USD');
            $table->foreignId('payment_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->text('student_notes')->nullable(); // What student wants to cover
            $table->enum('cancelled_by', ['student', 'tutor', 'admin'])->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            // Post-session review
            $table->tinyInteger('rating')->nullable(); // 1-5
            $table->text('review_text')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->boolean('tutor_paid')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'status']);
            $table->index(['tutor_id', 'status']);
            $table->index(['scheduled_at', 'status']);
            $table->index('status');
        });

        // Post-session notes from tutor
        Schema::create('session_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained('bookings')->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade');
            $table->text('notes'); // What was covered
            $table->text('homework')->nullable();
            $table->text('recommendations')->nullable(); // Recommended next topics
            $table->timestamps();
        });

        // Session recording metadata
        Schema::create('session_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained('bookings')->onDelete('cascade');
            $table->boolean('student_consented')->default(false);
            $table->boolean('tutor_consented')->default(false);
            $table->string('recording_url')->nullable(); // S3 URL
            $table->integer('duration_seconds')->nullable();
            $table->bigInteger('file_size_bytes')->nullable();
            $table->enum('status', ['pending', 'processing', 'available', 'expired', 'deleted'])->default('pending');
            $table->timestamp('expires_at')->nullable(); // Auto-expire after 90 days
            $table->timestamps();

            $table->index('booking_id');
        });

        // Tutor blocked time slots (unavailability overrides)
        Schema::create('tutor_blocked_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_profile_id')->constrained('tutor_profiles')->onDelete('cascade');
            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('ends_at')->useCurrent();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->index(['tutor_profile_id', 'starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_blocked_slots');
        Schema::dropIfExists('session_recordings');
        Schema::dropIfExists('session_notes');
        Schema::dropIfExists('bookings');
    }
};
