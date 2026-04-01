<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WithdrawalRequest extends Model
{
    protected $fillable = [
        'uuid', 'user_id', 'wallet_id', 'amount', 'currency',
        'status', 'payment_method', 'payment_details',
        'admin_note', 'processed_by', 'processed_at', 'gateway_reference',
    ];

    protected $casts = [
        'amount' => 'integer',
        'payment_details' => 'array',
        'processed_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->uuid ??= (string) Str::uuid());
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function getAmountInMajorUnitsAttribute(): float
    {
        return $this->amount / 100;
    }
}
