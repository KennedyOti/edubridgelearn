// frontend/src/app/(auth)/login/page.tsx
import { Suspense } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import LoginClient from '@/components/auth/LoginClient';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            {/* Animated loading state */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl animate-pulse">
                  <SparklesIcon className="h-12 w-12 text-primary/50" />
                </div>
                <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-ping" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-8 bg-[var(--border)] rounded-lg animate-pulse mx-auto max-w-[200px]" />
              <div className="h-4 bg-[var(--border)] rounded-lg animate-pulse mx-auto max-w-[300px]" />
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="h-12 bg-[var(--border)] rounded-lg animate-pulse" />
              <div className="h-12 bg-[var(--border)] rounded-lg animate-pulse" />
              <div className="h-12 bg-primary/20 rounded-lg animate-pulse" />
            </div>
            
            <p className="text-sm text-[var(--text-muted)] animate-pulse">
              Loading your secure login...
            </p>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}