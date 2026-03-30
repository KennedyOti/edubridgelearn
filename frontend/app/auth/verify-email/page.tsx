"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GraduationCap, Mail, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user?.email_verified) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-email", { otp: code });
      await fetchUser();
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { message: string }[] } } })
          ?.response?.data?.errors?.[0]?.message ??
        "Invalid or expired code.";
      setError(msg);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    try {
      await api.post("/auth/resend-verification");
      setResendCooldown(60);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { message: string }[] } } })
          ?.response?.data?.errors?.[0]?.message ?? "Failed to resend OTP.";
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-6">
            Your account is now active. Redirecting you to your dashboard…
          </p>
          <div className="w-full bg-green-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full animate-[expand_2s_ease-in-out_forwards]" style={{ width: "100%", animation: "width 2s ease-in-out" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary/5 p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-border shadow-xl shadow-black/5 overflow-hidden">
          {/* Header gradient band */}
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Edu<span className="text-primary">Bridge</span>
              </span>
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-foreground">{user?.email ?? "your email"}</span>.
              Enter it below to activate your account.
            </p>

            {/* OTP Inputs */}
            <div className="flex items-center gap-2.5 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`
                    flex-1 aspect-square rounded-xl border-2 text-center text-xl font-bold text-foreground
                    transition-all duration-200 focus:outline-none
                    ${digit ? "border-primary bg-primary-50 text-primary" : "border-border bg-white"}
                    ${error ? "border-error bg-red-50 shake" : "focus:border-primary focus:ring-4 focus:ring-primary/10"}
                  `}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Verify button */}
            <Button
              onClick={handleVerify}
              isLoading={isLoading}
              disabled={otp.join("").length < 6}
              className="w-full"
              size="lg"
            >
              Verify Email
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Resend */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground">Didn&apos;t receive the code?</span>
              <button
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
