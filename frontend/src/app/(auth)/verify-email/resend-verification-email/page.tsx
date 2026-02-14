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
      setError(
        err.response?.data?.message || "Oops! Could not resend. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 p-6 bg-white dark:bg-surface rounded-xl shadow-md text-center space-y-6">
      <h1 className="text-3xl font-bold gradient-text">Didn't get your link? 📬</h1>
      <p className="text-gray-500 text-sm">
        Enter your email and we’ll send it again so your learning powers can awaken.
      </p>

      {message && (
        <div className="text-green-700 bg-green-100 p-3 rounded-lg text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="text-danger bg-danger/10 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.email@school.edu"
        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
      />

      <button
        onClick={handleResend}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending magic link..." : "Resend Verification Link 🔁"}
      </button>
    </div>
  );
}
