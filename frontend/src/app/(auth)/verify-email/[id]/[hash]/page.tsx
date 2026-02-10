'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { authAPI } from '@/lib/api/auth';
import Link from 'next/link';

export default function VerifyEmailWithLinkPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { id, hash } = params;
        const response = await authAPI.verifyEmail(id as string, hash as string);
        
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify email. The link may be invalid or expired.');
      }
    };

    if (params.id && params.hash) {
      verifyEmail();
    }
  }, [params, router]);

  return (
    <AuthFormWrapper
      title="Email Verification"
      subtitle="Verifying your email address..."
    >
      <div className="space-y-6 text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
            <p className="text-[var(--text-muted)]">
              Please wait while we verify your email...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Email Verified!</h2>
            <p className="text-[var(--text-muted)]">{message}</p>
            <p className="text-sm text-[var(--text-muted)]">
              Redirecting to login page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Verification Failed</h2>
            <p className="text-[var(--text-muted)]">{message}</p>
            <div className="space-y-3">
              <Link
                href="/resend-verification"
                className="block w-full btn-secondary"
              >
                Request New Verification Link
              </Link>
              <Link
                href="/login"
                className="block w-full btn-primary"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthFormWrapper>
  );
}