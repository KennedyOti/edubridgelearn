<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonSubtitle extends Model
{
    protected $fillable = [
        'lesson_id', 'language', 'file_url', 'is_auto_generated', 'is_active',
    ];

    protected $casts = [
        'is_auto_generated' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
