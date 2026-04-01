<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends Model
{
    protected $fillable = [
        'student_id', 'lesson_id', 'watched_seconds', 'last_position_seconds',
        'is_completed', 'completed_at', 'last_watched_at',
    ];

    protected $casts = [
        'watched_seconds' => 'integer',
        'last_position_seconds' => 'integer',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'last_watched_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function getPercentageAttribute(): float
    {
        if (!$this->lesson || !$this->lesson->duration_seconds) {
            return 0;
        }

        return min(100, round(($this->watched_seconds / $this->lesson->duration_seconds) * 100, 1));
    }
}
