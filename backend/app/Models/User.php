<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'country',
        'timezone',
        'avatar_url',
        'google_id',
        'apple_id',
        'github_id',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'google_id',
        'apple_id',
        'github_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'locked_until' => 'datetime',
            'two_factor_enabled' => 'boolean',
            'two_factor_recovery_codes' => 'array',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function tutorProfile()
    {
        return $this->hasOne(TutorProfile::class);
    }

    public function contributorProfile()
    {
        return $this->hasOne(ContributorProfile::class);
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isTutor(): bool
    {
        return $this->role === 'tutor';
    }

    public function isContributor(): bool
    {
        return $this->role === 'contributor';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    public function isApproved(): bool
    {
        return $this->status === 'active';
    }

    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }
}
