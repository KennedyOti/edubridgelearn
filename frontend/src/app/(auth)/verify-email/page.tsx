'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/auth';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { authAPI } from '@/lib/api/auth';

export default function VerifyEmailPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await authAPI.resendVerification();
      setMessage({
        type: 'success',
        text: 'Verification email resent! Please check your inbox.',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to resend verification email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user.email_verified_at) {
    return (
      <AuthFormWrapper title="Email Verified">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Your email is verified!</h2>
          <p className="text-[var(--text-muted)]">
            You can now access all features. Redirecting to dashboard...
          </p>
        </div>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Verify Your Email"
      subtitle={`We sent a verification link to ${user.email}`}
    >
      {message && <FormMessage type={message.type} message={message.text} />}
      
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="space-y-3">
          <p className="text-[var(--text-muted)]">
            Check your email inbox and click the verification link to activate your account.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Didn't receive the email? Check your spam folder or request a new link.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full btn-secondary"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Resend Verification Email'}
          </button>
          
          <button
            onClick={checkAuth}
            className="w-full text-sm text-primary hover:text-primary-dark font-medium"
          >
            I've verified my email
          </button>
          
          <div className="pt-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">
              Using a different email?{' '}
              <button
                onClick={() => router.push('/logout')}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Logout and try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthFormWrapper>
  );
}