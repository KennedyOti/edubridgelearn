<?php

namespace App\Services;

use App\Models\AuthLog;
use App\Models\ContributorProfile;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthService
{
    public function register(array $data, string $ip, string $userAgent): array
    {
        return DB::transaction(function () use ($data, $ip, $userAgent) {
            $role = $data['role'] ?? 'student';

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role' => $role,
                'status' => in_array($role, ['tutor', 'contributor']) ? 'pending_approval' : 'active',
                'country' => $data['country'] ?? null,
                'timezone' => $data['timezone'] ?? 'UTC',
            ]);

            // Create role-specific profile
            match ($role) {
                'student' => StudentProfile::create(['user_id' => $user->id]),
                'tutor' => TutorProfile::create(['user_id' => $user->id]),
                'contributor' => ContributorProfile::create(['user_id' => $user->id]),
                default => null,
            };

            $token = $user->createToken('auth_token', [$role])->plainTextToken;

            $this->logAuth($user->id, $user->email, 'register', $ip, $userAgent);

            return [
                'user' => $user->load($this->getProfileRelation($role)),
                'token' => $token,
            ];
        });
    }

    public function login(string $email, string $password, string $ip, string $userAgent): array
    {
        $this->checkRateLimit($email);

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            $this->recordFailedAttempt($email, $ip, $userAgent);
            throw new \Exception('Invalid credentials.', 401);
        }

        if ($user->isLocked()) {
            throw new \Exception('Account is temporarily locked. Please try again later.', 423);
        }

        if ($user->status === 'suspended') {
            throw new \Exception('Your account has been suspended. Please contact support.', 403);
        }

        if ($user->status === 'deactivated') {
            throw new \Exception('Your account has been deactivated.', 403);
        }

        // Reset failed attempts
        $user->update([
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'last_login_at' => now(),
        ]);

        // Reset rate limit
        DB::table('login_rate_limits')->where('email', $email)->delete();

        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

        $this->logAuth($user->id, $email, 'login', $ip, $userAgent);

        return [
            'user' => $user->load($this->getProfileRelation($user->role)),
            'token' => $token,
            'requires_2fa' => $user->two_factor_enabled,
        ];
    }

    public function logout(User $user, string $ip, string $userAgent): void
    {
        $user->currentAccessToken()->delete();
        $this->logAuth($user->id, $user->email, 'logout', $ip, $userAgent);
    }

    public function refreshToken(User $user): string
    {
        $user->currentAccessToken()->delete();
        return $user->createToken('auth_token', [$user->role])->plainTextToken;
    }

    public function forgotPassword(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw new \Exception(__($status), 400);
        }

        return __($status);
    }

    public function resetPassword(array $data, string $ip, string $userAgent): void
    {
        $status = Password::reset(
            [
                'email' => $data['email'],
                'password' => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
                'token' => $data['token'],
            ],
            function (User $user, string $password) use ($ip, $userAgent) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
                $this->logAuth($user->id, $user->email, 'password_reset', $ip, $userAgent);
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new \Exception(__($status), 400);
        }
    }

    public function handleSocialLogin(string $provider, object $socialUser, string $ip, string $userAgent): array
    {
        $providerIdField = $provider . '_id';

        $user = User::where($providerIdField, $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        if (!$user) {
            $user = User::create([
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'avatar_url' => $socialUser->getAvatar(),
                $providerIdField => $socialUser->getId(),
                'password' => Hash::make(Str::random(32)),
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            StudentProfile::create(['user_id' => $user->id]);
        } else {
            $user->update([
                $providerIdField => $socialUser->getId(),
                'avatar_url' => $user->avatar_url ?? $socialUser->getAvatar(),
            ]);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

        $this->logAuth($user->id, $user->email, 'social_login', $ip, $userAgent, ['provider' => $provider]);

        return [
            'user' => $user->load($this->getProfileRelation($user->role)),
            'token' => $token,
        ];
    }

    public function enable2FA(User $user): array
    {
        $secret = Str::random(32); // In production, use TOTP library
        $recoveryCodes = collect(range(1, 8))->map(fn() => Str::random(10))->toArray();

        $user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            'two_factor_enabled' => true,
        ]);

        $this->logAuth($user->id, $user->email, '2fa_enabled', request()->ip(), request()->userAgent());

        return [
            'secret' => $secret,
            'recovery_codes' => $recoveryCodes,
        ];
    }

    public function disable2FA(User $user): void
    {
        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_enabled' => false,
        ]);

        $this->logAuth($user->id, $user->email, '2fa_disabled', request()->ip(), request()->userAgent());
    }

    public function deleteAccount(User $user, string $ip, string $userAgent): void
    {
        $this->logAuth($user->id, $user->email, 'account_deleted', $ip, $userAgent);
        $user->tokens()->delete();
        $user->delete(); // Soft delete
    }

    private function checkRateLimit(string $email): void
    {
        $record = DB::table('login_rate_limits')->where('email', $email)->first();

        if ($record && $record->locked_until && now()->lt($record->locked_until)) {
            throw new \Exception('Too many login attempts. Please try again later.', 429);
        }
    }

    private function recordFailedAttempt(string $email, string $ip, string $userAgent): void
    {
        $record = DB::table('login_rate_limits')->where('email', $email)->first();
        $attempts = $record ? $record->attempts + 1 : 1;

        $lockedUntil = null;
        if ($attempts >= 5) {
            // Progressive lockout: 1min, 5min, 15min, 30min, 1hr
            $lockMinutes = match (true) {
                $attempts >= 20 => 60,
                $attempts >= 15 => 30,
                $attempts >= 10 => 15,
                $attempts >= 7 => 5,
                default => 1,
            };
            $lockedUntil = now()->addMinutes($lockMinutes);
        }

        DB::table('login_rate_limits')->updateOrInsert(
            ['email' => $email],
            [
                'attempts' => $attempts,
                'locked_until' => $lockedUntil,
                'last_attempt_at' => now(),
                'updated_at' => now(),
            ]
        );

        $this->logAuth(null, $email, 'failed_login', $ip, $userAgent, ['attempts' => $attempts]);

        if ($lockedUntil) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->update(['locked_until' => $lockedUntil, 'failed_login_attempts' => $attempts]);
                $this->logAuth($user->id, $email, 'account_locked', $ip, $userAgent);
            }
        }
    }

    private function logAuth(?int $userId, ?string $email, string $event, string $ip, string $userAgent, ?array $metadata = null): void
    {
        AuthLog::create([
            'user_id' => $userId,
            'email' => $email,
            'event' => $event,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'metadata' => $metadata,
        ]);
    }

    private function getProfileRelation(string $role): array
    {
        return match ($role) {
            'tutor' => ['tutorProfile'],
            'contributor' => ['contributorProfile'],
            default => ['studentProfile'],
        };
    }
}
