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
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold text-center">Reset Your Password 🔑</h1>
      <p className="text-gray-500 text-sm text-center">
        We’ll send a reset link to your email.
      </p>

      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded">{message}</div>
      )}
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your account email"
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
