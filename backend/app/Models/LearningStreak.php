<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningStreak extends Model
{
    protected $fillable = [
        'user_id', 'current_streak', 'longest_streak',
        'last_activity_date', 'streak_frozen_until', 'freeze_count_remaining',
    ];

    protected $casts = [
        'current_streak' => 'integer',
        'longest_streak' => 'integer',
        'last_activity_date' => 'date',
        'streak_frozen_until' => 'date',
        'freeze_count_remaining' => 'integer',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function isFrozen(): bool
    {
        return $this->streak_frozen_until && $this->streak_frozen_until->isFuture();
    }
}
