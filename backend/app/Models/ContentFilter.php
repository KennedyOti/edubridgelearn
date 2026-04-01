<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentFilter extends Model
{
    protected $fillable = [
        'parent_child_link_id', 'restricted_community_ids', 'restricted_subject_ids',
        'disable_community', 'disable_ai_teacher', 'safe_search_only',
    ];

    protected $casts = [
        'restricted_community_ids' => 'array',
        'restricted_subject_ids' => 'array',
        'disable_community' => 'boolean',
        'disable_ai_teacher' => 'boolean',
        'safe_search_only' => 'boolean',
    ];

    public function parentChildLink(): BelongsTo { return $this->belongsTo(ParentChildLink::class); }
}
