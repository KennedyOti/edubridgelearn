// app/(auth)/forgot-password/page.tsx

import ForgotPasswordClient from '@/components/auth/ForgotPasswordClient';
import { Suspense } from 'react';

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading…</p>
        </div>
      }
    >
      <ForgotPasswordClient />
    </Suspense>
  );
}
