import VerifyEmailClient from "@/components/auth/VerifyEmailClient";
import { Suspense } from "react";

interface PageProps {
  searchParams: { id?: string; hash?: string };
}

export default function VerifyEmailPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="text-center mt-10">Verifying your magic... ⏳</div>}>
      <VerifyEmailClient id={searchParams.id} hash={searchParams.hash} />
    </Suspense>
  );
}