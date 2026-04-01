<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Lesson extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'tutor_id', 'title', 'description', 'thumbnail_url',
        'original_video_url', 'video_url_360p', 'video_url_720p', 'video_url_1080p',
        'duration_seconds', 'file_size_bytes',
        'curriculum_id', 'education_level_id', 'subject_id', 'topic_id', 'subtopic_id',
        'access_type', 'price', 'currency',
        'status', 'transcoding_status', 'allows_download',
        'rejection_reason', 'views_count', 'purchases_count', 'avg_rating',
        'published_at',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'file_size_bytes' => 'integer',
        'price' => 'integer',
        'views_count' => 'integer',
        'purchases_count' => 'integer',
        'avg_rating' => 'float',
        'allows_download' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->uuid ??= (string) Str::uuid());
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
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

    public function chapters(): HasMany
    {
        return $this->hasMany(LessonChapter::class)->orderBy('sort_order');
    }

    public function subtitles(): HasMany
    {
        return $this->hasMany(LessonSubtitle::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(LessonReview::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(LessonPurchase::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isFree(): bool
    {
        return $this->access_type === 'free';
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFree($query)
    {
        return $query->where('access_type', 'free');
    }
}
