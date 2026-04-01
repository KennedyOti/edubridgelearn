<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'education_level_id', 'name', 'code', 'grade_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'grade_order' => 'integer',
    ];

    public function educationLevel(): BelongsTo
    {
        return $this->belongsTo(EducationLevel::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
