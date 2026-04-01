<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class FlashcardDeck extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'creator_id', 'title', 'description',
        'subject_id', 'topic_id', 'is_public', 'cards_count',
    ];

    protected $casts = ['is_public' => 'boolean', 'cards_count' => 'integer'];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->uuid ??= (string) Str::uuid());
    }

    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'creator_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
    public function topic(): BelongsTo { return $this->belongsTo(Topic::class); }
    public function flashcards(): HasMany { return $this->hasMany(Flashcard::class, 'deck_id')->orderBy('sort_order'); }
}
