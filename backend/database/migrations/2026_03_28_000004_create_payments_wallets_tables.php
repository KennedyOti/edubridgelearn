<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // All financial transactions
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->enum('gateway', ['mpesa', 'stripe', 'paypal', 'flutterwave', 'wallet', 'free']);
            $table->bigInteger('amount'); // Stored in smallest currency unit (cents, centavos)
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'])->default('pending');
            $table->string('reference')->unique()->nullable(); // Internal reference
            $table->string('gateway_reference')->nullable(); // External gateway transaction ID
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Gateway-specific data
            // Polymorphic: booking, resource_purchase, subscription
            $table->nullableMorphs('payable');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('gateway');
            $table->index('status');
        });

        // Earnings wallets for tutors and contributors
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->bigInteger('balance')->default(0); // In smallest unit
            $table->bigInteger('pending_balance')->default(0); // Escrow/processing
            $table->string('currency', 3)->default('USD');
            $table->timestamp('last_payout_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });

        // Wallet transaction ledger
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->enum('type', ['credit', 'debit', 'escrow_hold', 'escrow_release', 'commission_deduct']);
            $table->bigInteger('amount'); // Always positive
            $table->bigInteger('balance_after'); // Running balance snapshot
            $table->string('currency', 3)->default('USD');
            $table->text('description')->nullable();
            // Polymorphic: booking, resource_purchase, withdrawal_request
            $table->nullableMorphs('reference');
            $table->string('commission_rate')->nullable(); // e.g. "15%" stored as string
            $table->timestamps();

            $table->index('wallet_id');
            $table->index('type');
        });

        // Payout / withdrawal requests
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('restrict');
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['pending', 'approved', 'processing', 'completed', 'rejected'])->default('pending');
            $table->enum('payment_method', ['mpesa', 'bank_transfer', 'paypal', 'stripe_connect']);
            $table->json('payment_details'); // Phone number, bank details, etc.
            $table->text('admin_note')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('processed_at')->nullable();
            $table->string('gateway_reference')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('payments');
    }
};
