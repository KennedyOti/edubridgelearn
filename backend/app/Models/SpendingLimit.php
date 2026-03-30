<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpendingLimit extends Model
{
    protected $fillable = [
        'parent_child_link_id', 'monthly_limit', 'currency',
        'current_month_spent', 'reset_date', 'require_approval',
    ];

    protected $casts = [
        'monthly_limit' => 'integer',
        'current_month_spent' => 'integer',
        'reset_date' => 'date',
        'require_approval' => 'boolean',
    ];

    public function parentChildLink(): BelongsTo { return $this->belongsTo(ParentChildLink::class); }

    public function hasRemainingBudget(int $amount): bool
    {
        return ($this->current_month_spent + $amount) <= $this->monthly_limit;
    }
}
