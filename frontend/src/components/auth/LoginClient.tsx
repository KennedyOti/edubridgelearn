// frontend/src/components/auth/LoginClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/lib/hooks/auth';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import InputField from '@/components/auth/InputField';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

/* ---------------------------------------------
   Enhanced Schema with better validation
--------------------------------------------- */
const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

/* ---------------------------------------------
   Demo credentials for testing (optional)
--------------------------------------------- */
const DEMO_CREDENTIALS = [
  { email: 'student@example.com', password: 'password123', role: 'Student' },
  { email: 'tutor@example.com', password: 'password123', role: 'Tutor' },
  { email: 'contributor@example.com', password: 'password123', role: 'Contributor' },
];

/* ---------------------------------------------
   Component
--------------------------------------------- */
export default function LoginClient() {
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
    mode: 'onChange',
  });

  const watchEmail = watch('email');
  const watchPassword = watch('password');

  /* ---------------------------------------------
     Handle URL messages with animations
  --------------------------------------------- */
  useEffect(() => {
    const registered = searchParams.get('registered');
    const verified = searchParams.get('verified');
    const message = searchParams.get('message');
    const expired = searchParams.get('expired');

    if (registered === 'true') {
      setMessage({
        type: 'success',
        text: '🎉 Registration successful! Please verify your email before logging in.',
      });
    }

    if (verified === 'true') {
      setMessage({
        type: 'success',
        text: '✅ Email verified successfully! You can now log in.',
      });
    }

    if (expired === 'true') {
      setMessage({
        type: 'info',
        text: 'Your session has expired. Please log in again.',
      });
    }

    if (message === 'pending_approval') {
      router.push('/pending-approval');
    }

    if (message === 'unverified') {
      setMessage({
        type: 'info',
        text: '📧 Please verify your email address before logging in.',
      });
    }

    if (message === 'password_reset') {
      setMessage({
        type: 'success',
        text: '🔑 Password reset successful! You can now log in with your new password.',
      });
    }

    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [searchParams, router, user]);

  /* ---------------------------------------------
     Submit handler
  --------------------------------------------- */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        // Success message will be shown briefly before redirect
        setMessage({
          type: 'success',
          text: '🎉 Login successful! Redirecting...',
        });
        
        // Redirect after a brief delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Invalid email or password. Please try again.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    }

    setIsLoading(false);
  };

  /* ---------------------------------------------
     Fill demo credentials
  --------------------------------------------- */
  const fillDemoCredentials = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setShowDemoCredentials(false);
    setMessage({
      type: 'info',
      text: `✨ Demo credentials filled for ${email.split('@')[0]}. Click "Sign In" to continue.`,
    });
  };

  return (
    <AuthFormWrapper
      title="Welcome Back"
      subtitle="Sign in to your account to continue your learning journey"
    >
      {message && (
        <div className="animate-slideDown">
          <FormMessage type={message.type} message={message.text} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <div className="relative">
            <InputField
              label="Email Address"
              type="email"
              name="email"
              register={register}
              error={errors.email}
              placeholder="john@example.com"
              required
              icon={<EnvelopeIcon className="h-5 w-5 text-[var(--text-muted)]" />}
              className="pl-10"
            />
            {watchEmail && !errors.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircleIcon className="h-5 w-5 text-success" />
              </div>
            )}
          </div>
          {watchEmail && !errors.email && (
            <p className="text-xs text-success flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              Valid email format
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              register={register}
              error={errors.password}
              placeholder="••••••••"
              required
              icon={<LockClosedIcon className="h-5 w-5 text-[var(--text-muted)]" />}
              className="pl-10 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {watchPassword && (
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3 text-success" />
              Password entered
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('remember_me')}
              className="w-4 h-4 rounded border-[var(--border)] text-primary focus:ring-primary focus:ring-offset-0"
            />
            <span className="text-sm text-[var(--text)]">Remember me</span>
          </label>
          
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            Forgot password?
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isDirty || !isValid}
          className={`
            w-full btn-primary relative overflow-hidden group
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary
            transition-all duration-200
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 group-disabled:hidden bg-gradient-to-r from-white/10 to-transparent transition-transform duration-300" />
        </button>

        {/* Demo Credentials Toggle */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="px-3 py-1 bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-full border border-[var(--border)] text-xs font-medium transition-colors flex items-center gap-1"
            >
              <SparklesIcon className="h-3 w-3" />
              Try Demo
            </button>
          </div>
        </div>

        {/* Demo Credentials Panel */}
        {showDemoCredentials && (
          <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] animate-slideUp">
            <h4 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-warning" />
              Quick Login with Demo Accounts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => fillDemoCredentials(cred.email, cred.password)}
                  className="p-2 text-left rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all group"
                >
                  <div className="text-sm font-medium text-[var(--text)] group-hover:text-primary">
                    {cred.role}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {cred.email}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 italic">
              For demonstration purposes only. Do not use real credentials.
            </p>
          </div>
        )}

        {/* Additional Links */}
        <div className="space-y-2 pt-2">
          <Link
            href="/resend-verification"
            className="block text-center text-sm text-[var(--text-muted)] hover:text-primary transition-colors"
          >
            Didn't receive verification email?
            <span className="ml-1 font-medium text-primary">Resend</span>
          </Link>
        </div>
      </form>

      {/* Sign Up Link */}
      <div className="mt-6 pt-6 border-t border-[var(--border)]">
        <p className="text-center text-sm text-[var(--text-muted)]">
          New to our platform?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1"
          >
            Create an account
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </AuthFormWrapper>
  );
}