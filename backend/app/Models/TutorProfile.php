<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }
}
