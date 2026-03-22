<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContributorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'expertise_areas',
        'verification_status',
    ];

    protected function casts(): array
    {
        return [
            'expertise_areas' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
