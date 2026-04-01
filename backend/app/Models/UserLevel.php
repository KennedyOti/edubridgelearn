<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLevel extends Model
{
    protected $fillable = [
        'user_id', 'subject_id', 'level_name', 'level_number', 'total_xp', 'xp_to_next_level',
    ];

    protected $casts = ['level_number' => 'integer', 'total_xp' => 'integer', 'xp_to_next_level' => 'integer'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
}
