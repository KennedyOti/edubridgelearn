<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlashcardReview extends Model
{
    protected $fillable = [
        'student_id', 'flashcard_id', 'ease_factor', 'interval_days',
        'repetitions', 'last_quality', 'due_date', 'last_reviewed_at',
    ];

    protected $casts = [
        'ease_factor' => 'float',
        'interval_days' => 'integer',
        'repetitions' => 'integer',
        'last_quality' => 'integer',
        'due_date' => 'date',
        'last_reviewed_at' => 'datetime',
    ];

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function flashcard(): BelongsTo { return $this->belongsTo(Flashcard::class); }
}
