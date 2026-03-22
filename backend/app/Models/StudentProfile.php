<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id',
        'education_level',
        'curriculum',
        'grade',
        'institution',
        'subjects',
        'learning_goals',
        'preferred_schedule',
        'onboarding_completed',
    ];

    protected function casts(): array
    {
        return [
            'subjects' => 'array',
            'learning_goals' => 'array',
            'preferred_schedule' => 'array',
            'onboarding_completed' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
