<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\EmailVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private EmailVerificationService $emailVerificationService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register(
            $request->validated(),
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
            'meta' => ['message' => 'Registration successful.'],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login(
                $request->email,
                $request->password,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'data' => [
                    'user' => new UserResource($result['user']),
                    'token' => $result['token'],
                    'requires_2fa' => $result['requires_2fa'],
                ],
                'meta' => ['message' => 'Login successful.'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [['message' => $e->getMessage()]],
            ], (int) $e->getCode() ?: 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout(
            $request->user(),
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'meta' => ['message' => 'Logged out successfully.'],
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $token = $this->authService->refreshToken($request->user());

        return response()->json([
            'data' => ['token' => $token],
            'meta' => ['message' => 'Token refreshed.'],
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        try {
            $message = $this->authService->forgotPassword($request->email);
            return response()->json([
                'meta' => ['message' => $message],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [['message' => $e->getMessage()]],
            ], (int) $e->getCode() ?: 400);
        }
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $this->authService->resetPassword(
                $request->validated(),
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'meta' => ['message' => 'Password reset successful.'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [['message' => $e->getMessage()]],
            ], (int) $e->getCode() ?: 400);
        }
    }

    public function socialRedirect(string $provider): JsonResponse
    {
        if (!in_array($provider, ['google', 'apple', 'github'])) {
            return response()->json([
                'errors' => [['message' => 'Unsupported provider.']],
            ], 400);
        }

        $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

        return response()->json([
            'data' => ['redirect_url' => $url],
        ]);
    }

    public function socialCallback(string $provider, Request $request): JsonResponse
    {
        if (!in_array($provider, ['google', 'apple', 'github'])) {
            return response()->json([
                'errors' => [['message' => 'Unsupported provider.']],
            ], 400);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $result = $this->authService->handleSocialLogin(
                $provider,
                $socialUser,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'data' => [
                    'user' => new UserResource($result['user']),
                    'token' => $result['token'],
                ],
                'meta' => ['message' => 'Social login successful.'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [['message' => 'Social authentication failed.']],
            ], 401);
        }
    }

    public function enable2FA(Request $request): JsonResponse
    {
        $result = $this->authService->enable2FA($request->user());

        return response()->json([
            'data' => $result,
            'meta' => ['message' => 'Two-factor authentication enabled.'],
        ]);
    }

    public function disable2FA(Request $request): JsonResponse
    {
        $this->authService->disable2FA($request->user());

        return response()->json([
            'meta' => ['message' => 'Two-factor authentication disabled.'],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $relation = match ($user->role) {
            'tutor' => 'tutorProfile',
            'contributor' => 'contributorProfile',
            'student' => 'studentProfile',
            default => null, // admin, super_admin, moderator have no profile relation
        };

        return response()->json([
            'data' => new UserResource($relation ? $user->load($relation) : $user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:100',
            'avatar_url' => 'nullable|url|max:500',
        ]);

        $request->user()->update($request->only(['name', 'phone', 'country', 'timezone', 'avatar_url']));

        return response()->json([
            'data' => new UserResource($request->user()->fresh()),
            'meta' => ['message' => 'Profile updated.'],
        ]);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate(['otp' => 'required|string|size:6']);

        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'meta' => ['message' => 'Email is already verified.'],
            ]);
        }

        try {
            $this->emailVerificationService->verifyOtp($user, $request->otp);

            return response()->json([
                'data' => new UserResource($user->fresh()),
                'meta' => ['message' => 'Email verified successfully.'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [['message' => $e->getMessage()]],
            ], (int) $e->getCode() ?: 400);
        }
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $this->emailVerificationService->resendOtp($user);

            return response()->json([
                'meta' => ['message' => 'Verification OTP sent to ' . $user->email],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [['message' => $e->getMessage()]],
            ], (int) $e->getCode() ?: 400);
        }
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json([
                'errors' => [['message' => 'Invalid password.']],
            ], 403);
        }

        $this->authService->deleteAccount(
            $request->user(),
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'meta' => ['message' => 'Account scheduled for deletion.'],
        ]);
    }
}
