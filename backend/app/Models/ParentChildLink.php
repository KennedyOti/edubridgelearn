<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ParentChildLink extends Model
{
    protected $fillable = [
        'parent_user_id', 'child_user_id', 'relationship',
        'is_verified', 'verified_at', 'verification_token',
    ];

    protected $casts = ['is_verified' => 'boolean', 'verified_at' => 'datetime'];

    public function parent(): BelongsTo { return $this->belongsTo(User::class, 'parent_user_id'); }
    public function child(): BelongsTo { return $this->belongsTo(User::class, 'child_user_id'); }
    public function spendingLimit(): HasOne { return $this->hasOne(SpendingLimit::class); }
    public function contentFilter(): HasOne { return $this->hasOne(ContentFilter::class); }
}
