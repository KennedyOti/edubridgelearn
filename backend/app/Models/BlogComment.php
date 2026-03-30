<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogComment extends Model
{
    use SoftDeletes;

    protected $fillable = ['blog_post_id', 'user_id', 'parent_id', 'body', 'is_approved', 'is_spam'];

    protected $casts = ['is_approved' => 'boolean', 'is_spam' => 'boolean'];

    public function post(): BelongsTo { return $this->belongsTo(BlogPost::class, 'blog_post_id'); }
    public function author(): BelongsTo { return $this->belongsTo(User::class, 'user_id'); }
    public function parent(): BelongsTo { return $this->belongsTo(BlogComment::class, 'parent_id'); }
    public function replies(): HasMany { return $this->hasMany(BlogComment::class, 'parent_id'); }
}
