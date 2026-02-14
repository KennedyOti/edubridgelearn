// frontend/src/app/(auth)/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { authService } from "@/lib/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.data.message || "Check your email for the reset link!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 space-y-6 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-center">Reset Your Password 🔑</h1>
      <p className="text-text-muted text-sm text-center">
        We’ll send a reset link to your email.
      </p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your account email"
          className="input"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="btn btn-brand w-full flex justify-center items-center disabled:opacity-60"
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
