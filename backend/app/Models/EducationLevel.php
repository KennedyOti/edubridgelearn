<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationLevel extends Model
{
    protected $fillable = [
        'curriculum_id', 'name', 'code', 'group_label',
        'level_order', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level_order' => 'integer',
    ];

    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class)->orderBy('grade_order');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class)->orderBy('sort_order');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
