<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class AiChatSession extends Model
{
    protected $fillable = [
        'uuid', 'student_id', 'subject_id', 'topic_id',
        'title', 'messages_count', 'total_tokens_used',
        'last_message_at', 'is_archived',
    ];

    protected $casts = [
        'messages_count' => 'integer',
        'total_tokens_used' => 'integer',
        'last_message_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->uuid ??= (string) Str::uuid());
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiMessage::class, 'session_id')->orderBy('created_at');
    }
}
