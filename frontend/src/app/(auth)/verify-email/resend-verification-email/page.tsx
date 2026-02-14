// frontend/src/app/(auth)/verify-email/resend-veification-email/page.tsx

"use client";

import { useState } from "react";
import { authService } from "@/lib/services/auth.service";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) {
      setError("We need your email to send the magic link ✨");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await authService.resendVerificationPublic(email);
      setMessage(res.data.message || "Verification link sent! 🚀");
    } catch (err: any) {
      setError(err.response?.data?.message || "Oops! Could not resend. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 p-6 bg-surface dark:bg-surface rounded-2xl shadow-sm text-center space-y-6 transition-theme">
      <h1 className="text-3xl font-bold gradient-brand">
        Didn't get your link? 📬
      </h1>
      <p className="text-text-muted text-sm">
        Enter your email and we’ll send it again so your learning powers can awaken.
      </p>

      {message && <div className="alert alert-success text-sm">{message}</div>}
      {error && <div className="alert alert-danger text-sm">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.email@school.edu"
        className="input"
      />

      <button
        onClick={handleResend}
        disabled={loading}
        className="btn btn-brand w-full flex justify-center items-center disabled:opacity-60"
      >
        {loading ? "Sending magic link..." : "Resend Verification Link 🔁"}
      </button>
    </div>
  );
}

