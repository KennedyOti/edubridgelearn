'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/auth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
  requireApproved?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireVerified = true,
  requireApproved = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user) {
      if (requireVerified && !user.email_verified_at) {
        router.push('/verify-email');
        return;
      }
      
      if (requireApproved && !user.approved_at) {
        router.push('/login?message=pending_approval');
        return;
      }
    }
  }, [user, loading, router, requireVerified, requireApproved]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}