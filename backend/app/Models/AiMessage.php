<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMessage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'session_id', 'role', 'content', 'tokens_used',
        'model_used', 'is_flagged', 'flag_reason', 'metadata',
    ];

    protected $casts = [
        'tokens_used' => 'integer',
        'is_flagged' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiChatSession::class, 'session_id');
    }
}
