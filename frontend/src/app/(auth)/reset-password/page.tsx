// app/(auth)/reset-password/page.tsx

import ResetPasswordClient from '@/components/auth/ResetPasswordClient';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading reset password page…</p>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
