<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonPurchase extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'student_id', 'lesson_id', 'payment_id', 'amount_paid', 'currency', 'purchased_at',
    ];

    protected $casts = [
        'amount_paid' => 'integer',
        'purchased_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
