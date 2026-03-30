<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price_monthly', 'price_yearly',
        'currency', 'ai_queries_per_day', 'recorded_lessons_per_month',
        'live_sessions_per_month', 'includes_all_lessons', 'priority_support',
        'features', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price_monthly' => 'integer',
        'price_yearly' => 'integer',
        'ai_queries_per_day' => 'integer',
        'recorded_lessons_per_month' => 'integer',
        'live_sessions_per_month' => 'integer',
        'includes_all_lessons' => 'boolean',
        'priority_support' => 'boolean',
        'features' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    public function isFree(): bool
    {
        return $this->price_monthly === 0;
    }

    public function hasUnlimitedAI(): bool
    {
        return $this->ai_queries_per_day === -1;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
