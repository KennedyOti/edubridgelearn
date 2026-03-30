<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrolledSubjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'student_subjects')
            ->withPivot(['is_primary'])
            ->withTimestamps();
    }

    public function primarySubjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'student_subjects')
            ->wherePivot('is_primary', true)
            ->withTimestamps();
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class, 'student_id', 'user_id');
    }

    public function educationLevelRecord()
    {
        return EducationLevel::where('code', $this->education_level)->first();
    }
}
