<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiUsageTracking extends Model
{
    protected $fillable = [
        'user_id', 'date', 'queries_used', 'tokens_used', 'quota_limit',
    ];

    protected $casts = [
        'date' => 'date',
        'queries_used' => 'integer',
        'tokens_used' => 'integer',
        'quota_limit' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasQuotaRemaining(): bool
    {
        return $this->queries_used < $this->quota_limit;
    }

    public function remainingQueries(): int
    {
        return max(0, $this->quota_limit - $this->queries_used);
    }
}
