// src/components/auth/RegisterForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validators/auth.schema";
import { z } from "zod";
import { authService } from "@/lib/services/auth.service";
import { useState, useEffect } from "react";
import RoleSelector from "./RoleSelector";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const selectedRole = watch("role");
  const password = watch("password");
  const passwordConfirmation = watch("password_confirmation");

  // Auto-redirect countdown when email sent
  useEffect(() => {
    if (!emailSent) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/verify-email");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/verify-email");
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [emailSent, router]);

  const nextStep = () => {
    if (!selectedRole) return;
    setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    setServerError("");

    try {
      await authService.register(data);

      localStorage.setItem("pendingVerificationEmail", data.email);

      setEmailSent(true);
      setCountdown(10);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setServerError(
        msg ||
          "Registration failed. Please try again or contact support if the issue persists."
      );
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[a-z]/)) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password || "");

  // ─── Success screen with countdown ───
  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8 text-center space-y-6 max-w-md mx-auto"
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand to-purple-accent rounded-full flex items-center justify-center animate-pulse shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold gradient-brand animate-gradient">
          Check Your Email!
        </h2>

        <div className="space-y-4 text-text-muted">
          <p className="text-lg leading-relaxed">
            We’ve sent a 6-digit verification code to your email.
          </p>
          <p className="text-base font-medium">
            Redirecting to verification page in{" "}
            <strong className="text-brand">{countdown}</strong> seconds...
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => router.push("/verify-email")}
            className="btn btn-brand w-full max-w-xs mx-auto py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Verify Now
          </button>
        </div>

        <div className="pt-6 border-t border-default/60">
          <p className="text-sm text-text-muted">
            Didn’t receive the email?{" "}
            <Link
              href="/verify-email/resend-verification-email"
              className="text-brand hover:text-brand-hover font-medium transition-colors hover:underline"
            >
              Resend code
            </Link>
          </p>
        </div>
      </motion.div>
    );
  }

  // ─── Registration form ───
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold gradient-brand animate-gradient">
                Choose Your Role
              </h2>
              <p className="text-text-muted">This helps us personalize your experience</p>
            </div>

            <div className="glass-effect rounded-2xl p-6 shadow-sm">
              <RoleSelector
                value={selectedRole || ""}
                onChange={(role) => setValue("role", role, { shouldValidate: true })}
              />
              {errors.role && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-danger text-sm mt-4 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.role.message}
                </motion.p>
              )}
            </div>

            <motion.button
              type="button"
              onClick={nextStep}
              disabled={!selectedRole}
              className="btn btn-brand w-full group disabled:opacity-60 disabled:cursor-not-allowed py-3.5 text-lg"
              whileHover={{ scale: selectedRole ? 1.03 : 1 }}
              whileTap={{ scale: selectedRole ? 0.97 : 1 }}
            >
              Continue
              <svg
                className="w-5 h-5 group-hover:translate-x-1.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold gradient-brand animate-gradient">
                Create Your Account
              </h2>
              <p className="text-text-muted">Just a few details left!</p>
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-danger text-sm flex items-center gap-3 p-4 rounded-xl"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {serverError}
              </motion.div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="label flex items-center gap-2">
                <span>Name</span>
                <span className="text-brand text-lg">👤</span>
              </label>
              <div className="relative">
                <input
                  {...register("name")}
                  className={`input pl-11 ${errors.name ? "border-danger focus:ring-danger/30" : ""}`}
                  placeholder="Your full name"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              {errors.name?.message && (
                <p className="text-danger text-sm mt-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="label flex items-center gap-2">
                <span>Email</span>
                <span className="text-brand text-lg">✉️</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  className={`input pl-11 ${errors.email ? "border-danger focus:ring-danger/30" : ""}`}
                  placeholder="you@example.com"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              {errors.email?.message && (
                <p className="text-danger text-sm mt-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password + strength */}
            <div className="space-y-1.5">
              <label className="label flex items-center gap-2">
                <span>Password</span>
                <span className="text-brand text-lg">🔒</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password")}
                  className={`input pl-11 ${errors.password ? "border-danger focus:ring-danger/30" : ""}`}
                  placeholder="At least 8 characters"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {password && password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex gap-1 h-1.5">
                    <div
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        passwordStrength >= 25 ? "bg-danger" : "bg-border"
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        passwordStrength >= 50 ? "bg-warning" : "bg-border"
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        passwordStrength >= 75 ? "bg-academic" : "bg-border"
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        passwordStrength === 100 ? "bg-success" : "bg-border"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-text-muted/90 font-medium">
                    {passwordStrength < 50 && "Weak – needs improvement"}
                    {passwordStrength >= 50 && passwordStrength < 75 && "Moderate – getting better"}
                    {passwordStrength >= 75 && passwordStrength < 100 && "Strong"}
                    {passwordStrength === 100 && "Excellent – very secure!"}
                  </p>
                </div>
              )}

              {errors.password?.message && (
                <p className="text-danger text-sm mt-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="label flex items-center gap-2">
                <span>Confirm Password</span>
                <span className="text-brand text-lg">🔄</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password_confirmation")}
                  className={`input pl-11 ${errors.password_confirmation ? "border-danger focus:ring-danger/30" : ""}`}
                  placeholder="Type password again"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              {password &&
                passwordConfirmation &&
                password !== passwordConfirmation && (
                  <p className="text-warning text-sm mt-1.5 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Passwords do not match
                  </p>
                )}

              {errors.password_confirmation?.message && (
                <p className="text-danger text-sm mt-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-4 pt-6">
              <motion.button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="btn btn-brand w-full py-3.5 text-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                whileHover={{ scale: isValid ? 1.03 : 1 }}
                whileTap={{ scale: isValid ? 0.97 : 1 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Creating account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline w-full py-3.5 text-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </motion.button>

              <p className="text-center text-sm text-text-muted pt-3">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-brand font-medium hover:text-brand-hover transition-colors hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}