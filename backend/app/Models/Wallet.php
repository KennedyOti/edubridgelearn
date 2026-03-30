<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    protected $fillable = [
        'user_id', 'balance', 'pending_balance', 'currency', 'last_payout_at',
    ];

    protected $casts = [
        'balance' => 'integer',
        'pending_balance' => 'integer',
        'last_payout_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->latest();
    }

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    // Balance in major currency units
    public function getBalanceInMajorUnitsAttribute(): float
    {
        return $this->balance / 100;
    }

    public function hasSufficientBalance(int $amount): bool
    {
        return $this->balance >= $amount;
    }
}
