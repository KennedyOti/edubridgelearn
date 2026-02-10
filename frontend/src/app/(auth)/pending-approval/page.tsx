import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import Link from 'next/link';

export default function PendingApprovalPage() {
  return (
    <AuthFormWrapper
      title="Account Pending Approval"
      subtitle="Your account is being reviewed by our team"
    >
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-3">
          <p className="text-[var(--text-muted)]">
            Thank you for registering as a tutor/contributor! Our team is reviewing your application.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            You will receive an email notification once your account is approved.
            This process usually takes 24-48 hours.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            In the meantime, you can:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="card hover:border-primary transition-colors"
            >
              <h4 className="font-medium text-sm">Browse Courses</h4>
            </Link>
            <Link
              href="/login"
              className="card hover:border-primary transition-colors"
            >
              <h4 className="font-medium text-sm">Check Status</h4>
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            href="/login"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </AuthFormWrapper>
  );
}