<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TutorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'qualifications',
        'experience_years',
        'subjects',
        'hourly_rate',
        'rate_currency',
        'intro_video_url',
        'teaching_methodology',
        'verification_status',
        'rejection_reason',
        'verified_at',
        'next_reverification_at',
        'avg_rating',
        'total_sessions',
        'availability',
    ];

    protected function casts(): array
    {
        return [
            'qualifications' => 'array',
            'subjects' => 'array',
            'availability' => 'array',
            'hourly_rate' => 'decimal:2',
            'avg_rating' => 'decimal:2',
            'verified_at' => 'datetime',
            'next_reverification_at' => 'datetime',
            'experience_years' => 'integer',
            'total_sessions' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function qualificationRecords(): HasMany
    {
        return $this->hasMany(TutorQualification::class);
    }

    public function availabilitySlots(): HasMany
    {
        return $this->hasMany(TutorAvailability::class)->where('is_active', true)->orderBy('day_of_week')->orderBy('start_time');
    }

    public function blockedSlots(): HasMany
    {
        return $this->hasMany(TutorBlockedSlot::class);
    }

    public function taughtSubjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'tutor_subjects')
            ->withPivot(['education_level_id', 'hourly_rate_override', 'currency', 'is_active'])
            ->withTimestamps();
    }

    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function needsReverification(): bool
    {
        return $this->next_reverification_at && $this->next_reverification_at->isPast();
    }
}
