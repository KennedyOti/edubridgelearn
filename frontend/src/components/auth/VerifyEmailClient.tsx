// src/components/auth/VerifyEmailClient.tsx

"use client";

import { useState, useEffect } from "react";
import { authService } from "@/lib/services/auth.service";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailClient() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
      // You can keep it or remove — depends if you want to allow refresh
      // localStorage.removeItem("pendingVerificationEmail");
    } else {
      setStatus("error");
      setMessage("No email found for verification. Please register again or resend the code.");
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    if (otp.trim().length !== 6 || !/^\d{6}$/.test(otp)) {
      setStatus("error");
      setMessage("Please enter a valid 6-digit code.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await authService.verifyEmail({ email, otp: otp.trim() });

      setStatus("success");
      setMessage(response.data.message || "Email verified successfully!");

      localStorage.removeItem("pendingVerificationEmail");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2200);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Verification failed. Please check the code.");
      console.error("[VerifyEmail]", err.response?.data || err);
    }
  };

  if (status === "error" && !email) {
    return (
      <div className="text-center mt-16 text-danger space-y-4">
        <p className="text-lg">{message}</p>
        <Link href="/auth/register" className="text-brand underline hover:text-brand-hover">
          ← Back to registration
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-16 p-8 bg-surface rounded-2xl shadow-sm space-y-6">
      <h1 className="text-3xl font-bold text-center">
        {status === "success" ? "Account Verified 🎉" : "Verify Your Email"}
      </h1>

      {email && (
        <p className="text-center text-muted-foreground">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
      )}

      {status !== "success" && (
        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            className="input w-full text-center text-2xl tracking-[0.5em] font-mono"
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            disabled={status === "loading"}
            required
          />

          <button
            type="submit"
            className="btn btn-brand w-full py-3 text-lg font-medium"
            disabled={status === "loading" || !email || otp.length !== 6}
          >
            {status === "loading" ? "Verifying..." : "Confirm & Continue"}
          </button>
        </form>
      )}

      <div className="text-center space-y-3 text-sm">
        <Link
          href="/verify-email/resend-verification-email"
          className="text-brand hover:underline block"
        >
          Didn't receive the code? Resend
        </Link>

        <Link href="/auth/login" className="text-muted-foreground hover:underline">
          Already verified? Log in
        </Link>
      </div>

      {message && (
        <p
          className={`text-center text-sm font-medium ${
            status === "error" ? "text-danger" : "text-success"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}