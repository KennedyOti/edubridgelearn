<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'failed_login_attempts',
        'locked_until',
        'last_login_at',
        'email_verified_at',
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

    // ─── Role-specific profiles ───────────────────────────────────────────────

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function tutorProfile(): HasOne
    {
        return $this->hasOne(TutorProfile::class);
    }

    public function contributorProfile(): HasOne
    {
        return $this->hasOne(ContributorProfile::class);
    }

    // ─── Bookings ─────────────────────────────────────────────────────────────

    public function bookingsAsStudent(): HasMany
    {
        return $this->hasMany(Booking::class, 'student_id');
    }

    public function bookingsAsTutor(): HasMany
    {
        return $this->hasMany(Booking::class, 'tutor_id');
    }

    // ─── Lessons ──────────────────────────────────────────────────────────────

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'tutor_id');
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class, 'student_id');
    }

    public function lessonPurchases(): HasMany
    {
        return $this->hasMany(LessonPurchase::class, 'student_id');
    }

    // ─── Payments / Wallet ────────────────────────────────────────────────────

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    // ─── Subscriptions ────────────────────────────────────────────────────────

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->whereIn('status', ['active', 'trialing'])
            ->where(fn($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->latestOfMany('starts_at');
    }

    // ─── Communities ──────────────────────────────────────────────────────────

    public function communities(): BelongsToMany
    {
        return $this->belongsToMany(Community::class, 'community_members')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // ─── AI Teacher ───────────────────────────────────────────────────────────

    public function aiChatSessions(): HasMany
    {
        return $this->hasMany(AiChatSession::class, 'student_id');
    }

    // ─── Gamification ─────────────────────────────────────────────────────────

    public function xpTransactions(): HasMany
    {
        return $this->hasMany(XpTransaction::class);
    }

    public function userLevels(): HasMany
    {
        return $this->hasMany(UserLevel::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')->withPivot('earned_at');
    }

    public function learningStreak(): HasOne
    {
        return $this->hasOne(LearningStreak::class);
    }

    // ─── Email Verification ───────────────────────────────────────────────────

    public function emailVerifications(): HasMany
    {
        return $this->hasMany(EmailVerification::class);
    }

    // ─── Notification preferences ─────────────────────────────────────────────

    public function notificationPreferences(): HasMany
    {
        return $this->hasMany(NotificationPreference::class);
    }

    // ─── Parental controls ────────────────────────────────────────────────────

    public function parentLinks(): HasMany
    {
        return $this->hasMany(ParentChildLink::class, 'parent_user_id');
    }

    public function childLinks(): HasMany
    {
        return $this->hasMany(ParentChildLink::class, 'child_user_id');
    }

    // ─── Role helpers ─────────────────────────────────────────────────────────

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

    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }
}
