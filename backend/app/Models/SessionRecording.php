<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionRecording extends Model
{
    protected $fillable = [
        'booking_id', 'student_consented', 'tutor_consented',
        'recording_url', 'duration_seconds', 'file_size_bytes',
        'status', 'expires_at',
    ];

    protected $casts = [
        'student_consented' => 'boolean',
        'tutor_consented' => 'boolean',
        'duration_seconds' => 'integer',
        'file_size_bytes' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function bothConsented(): bool
    {
        return $this->student_consented && $this->tutor_consented;
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available'
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
