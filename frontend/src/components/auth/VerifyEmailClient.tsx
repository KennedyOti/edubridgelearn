"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth.service";

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default function VerifyEmailClient({ searchParams }: Props) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your magic...");

  useEffect(() => {
    const { id, hash, expires, signature } = searchParams;

    if (!id || !hash || !expires || !signature) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verify = async () => {
      try {
        const query = new URLSearchParams(searchParams as Record<string, string>).toString();
        const res = await authService.verifyEmail(query);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. Try again!");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="w-full max-w-md mx-auto mt-16 p-6 bg-surface dark:bg-surface rounded-2xl shadow-sm text-center space-y-6 transition-theme">
      <h1 className="text-3xl font-bold gradient-brand">
        {status === "loading"
          ? "Hold tight... ⏳"
          : status === "success"
          ? "Success! 🎉"
          : "Oops! ❌"}
      </h1>
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  );
}
