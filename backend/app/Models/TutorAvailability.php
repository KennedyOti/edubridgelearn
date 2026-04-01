<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorAvailability extends Model
{
    protected $table = 'tutor_availability';

    protected $fillable = [
        'tutor_profile_id', 'day_of_week', 'start_time', 'end_time', 'timezone', 'is_active',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'is_active' => 'boolean',
    ];

    // Day labels for convenience
    public static array $dayLabels = [
        0 => 'Sunday',
        1 => 'Monday',
        2 => 'Tuesday',
        3 => 'Wednesday',
        4 => 'Thursday',
        5 => 'Friday',
        6 => 'Saturday',
    ];

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    public function getDayNameAttribute(): string
    {
        return self::$dayLabels[$this->day_of_week] ?? 'Unknown';
    }
}
