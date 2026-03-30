<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class XpTransaction extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'subject_id', 'action', 'xp_earned',
        'reference_type', 'reference_id', 'description',
    ];

    protected $casts = ['xp_earned' => 'integer', 'created_at' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
    public function reference(): MorphTo { return $this->morphTo(); }
}
