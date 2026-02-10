import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <AuthFormWrapper
      title="Access Denied"
      subtitle="You don't have permission to access this page"
    >
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h2m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-3">
          <p className="text-[var(--text-muted)]">
            This could be because:
          </p>
          <ul className="text-sm text-[var(--text-muted)] space-y-1">
            <li>• Your account is not verified</li>
            <li>• Your account is pending approval</li>
            <li>• You don't have the required permissions</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full btn-primary"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="block w-full btn border border-[var(--border)] hover:border-primary"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </AuthFormWrapper>
  );
}