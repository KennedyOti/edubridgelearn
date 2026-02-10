<?php

namespace App\Models;

use App\Notifications\VerifyEmailCustom;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Helper methods for scalability
    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    public function isApproved(): bool
    {
        return $this->approved_at !== null || $this->role === 'student';  // Students auto-approved after verify
    }

    public function isStudent(): bool { return $this->role === 'student'; }
    public function isTutor(): bool { return $this->role === 'tutor'; }
    public function isContributor(): bool { return $this->role === 'contributor'; }
    public function isAdmin(): bool { return $this->role === 'admin'; }

    public function sendEmailVerificationNotification()
{
    $this->notify(new VerifyEmailCustom());
}
}
