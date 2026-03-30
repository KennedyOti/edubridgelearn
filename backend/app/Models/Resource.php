<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Resource extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'creator_id', 'title', 'description', 'type',
        'file_url', 'preview_url', 'file_size_bytes', 'file_mime_type',
        'curriculum_id', 'education_level_id', 'subject_id', 'topic_id', 'subtopic_id',
        'exam_year', 'examining_body',
        'access_type', 'price', 'currency',
        'status', 'rejection_reason',
        'downloads_count', 'purchases_count', 'avg_rating', 'version',
        'published_at',
    ];

    protected $casts = [
        'price' => 'integer',
        'file_size_bytes' => 'integer',
        'downloads_count' => 'integer',
        'purchases_count' => 'integer',
        'avg_rating' => 'float',
        'version' => 'integer',
        'exam_year' => 'integer',
        'published_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->uuid ??= (string) Str::uuid());
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    public function educationLevel(): BelongsTo
    {
        return $this->belongsTo(EducationLevel::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function subtopic(): BelongsTo
    {
        return $this->belongsTo(Subtopic::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'resource_tags');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(ResourcePurchase::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ResourceReview::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
