"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth.service";

interface Props {
  id?: string;
  hash?: string;
}

export default function VerifyEmailClient({ id, hash }: Props) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your magic...");

  useEffect(() => {
    if (!id || !hash) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verify = async () => {
      try {
        const query = `id=${id}&hash=${hash}`;
        const res = await authService.verifyEmail(id, hash, query);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. Try again!");
      }
    };

    verify();
  }, [id, hash]);

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
