<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'icon_url', 'color_hex',
        'criteria_type', 'criteria_value', 'subject_id', 'is_active',
    ];

    protected $casts = ['criteria_value' => 'integer', 'is_active' => 'boolean'];

    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_badges')->withPivot('earned_at');
    }
}
