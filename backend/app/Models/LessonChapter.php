<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonChapter extends Model
{
    protected $fillable = [
        'lesson_id', 'title', 'start_second', 'end_second', 'sort_order',
    ];

    protected $casts = [
        'start_second' => 'integer',
        'end_second' => 'integer',
        'sort_order' => 'integer',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
