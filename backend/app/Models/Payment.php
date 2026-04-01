<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    protected $fillable = [
        'uuid', 'user_id', 'gateway', 'amount', 'currency', 'status',
        'reference', 'gateway_reference', 'description', 'metadata',
        'payable_type', 'payable_id', 'paid_at', 'refunded_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($m) {
            $m->uuid ??= (string) Str::uuid();
            $m->reference ??= 'PAY-' . strtoupper(Str::random(12));
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // Helper: amount in major units (e.g. dollars, not cents)
    public function getAmountInMajorUnitsAttribute(): float
    {
        return $this->amount / 100;
    }
}
