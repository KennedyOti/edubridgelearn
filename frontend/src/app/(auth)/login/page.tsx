// app/(auth)/login/page.tsx

import LoginClient from '@/components/auth/LoginClient';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading login page…</p>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
