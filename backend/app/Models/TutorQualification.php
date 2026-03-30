<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorQualification extends Model
{
    protected $fillable = [
        'tutor_profile_id', 'title', 'institution', 'year',
        'certificate_url', 'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'year' => 'integer',
    ];

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }
}
