<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourcePurchase extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'student_id', 'resource_id', 'payment_id', 'amount_paid', 'currency', 'download_count', 'purchased_at',
    ];

    protected $casts = [
        'amount_paid' => 'integer',
        'download_count' => 'integer',
        'purchased_at' => 'datetime',
    ];

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function resource(): BelongsTo { return $this->belongsTo(Resource::class); }
    public function payment(): BelongsTo { return $this->belongsTo(Payment::class); }
}
