// frontend/src/app/(auth)/verify-email/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { authAPI } from '@/lib/api/auth';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const id = searchParams.get('id');
      const hash = searchParams.get('hash');

      if (!id || !hash) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const queryString = searchParams.toString();

        const response = await authAPI.verifyEmail(
          id,
          hash,
          queryString
        );

        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');

        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <AuthFormWrapper
      title="Email Verification"
      subtitle="Processing your verification link..."
    >
      <div className="space-y-6 text-center">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="md" />
            <p>Please wait while we verify your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-xl font-semibold text-secondary">
              Email Verified 🎉
            </h2>
            <p>{message}</p>
            <p className="text-sm">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-semibold text-danger">
              Verification Failed
            </h2>
            <p>{message}</p>

            <div className="space-y-3">
              <Link href="/login" className="btn-primary block">
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthFormWrapper>
  );
}
