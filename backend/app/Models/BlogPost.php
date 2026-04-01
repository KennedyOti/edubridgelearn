<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'author_id', 'category_id', 'title', 'slug', 'excerpt', 'body',
        'featured_image_url', 'status', 'rejection_reason', 'reading_time_minutes',
        'views_count', 'is_featured', 'published_at', 'seo_metadata',
    ];

    protected $casts = [
        'reading_time_minutes' => 'integer',
        'views_count' => 'integer',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'seo_metadata' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->uuid ??= (string) Str::uuid());
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'blog_post_tags');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(BlogComment::class)->whereNull('parent_id')->where('is_approved', true);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
