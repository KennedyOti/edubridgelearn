<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Flashcard extends Model
{
    protected $fillable = [
        'deck_id', 'front_content', 'back_content',
        'front_image_url', 'back_image_url', 'sort_order',
    ];

    protected $casts = ['sort_order' => 'integer'];

    public function deck(): BelongsTo { return $this->belongsTo(FlashcardDeck::class, 'deck_id'); }
    public function reviews(): HasMany { return $this->hasMany(FlashcardReview::class); }
}
