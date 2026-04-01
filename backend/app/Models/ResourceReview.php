<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourceReview extends Model
{
    protected $fillable = ['resource_id', 'student_id', 'rating', 'review_text', 'is_visible'];

    protected $casts = ['rating' => 'integer', 'is_visible' => 'boolean'];

    public function resource(): BelongsTo { return $this->belongsTo(Resource::class); }
    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
}
