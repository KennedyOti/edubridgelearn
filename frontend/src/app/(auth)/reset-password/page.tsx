// app/(auth)/reset-password/page.tsx

import ResetPasswordClient from "@/components/auth/ResetPasswordClient";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading reset portal...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
