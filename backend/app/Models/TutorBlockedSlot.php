<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorBlockedSlot extends Model
{
    protected $fillable = [
        'tutor_profile_id', 'starts_at', 'ends_at', 'reason',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    public function overlaps(\Carbon\Carbon $start, \Carbon\Carbon $end): bool
    {
        return $this->starts_at < $end && $this->ends_at > $start;
    }
}
