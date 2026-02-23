// frontend/src/app/(auth)/login/page.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators/auth.schema";
import { z } from "zod";
import { authService } from "@/lib/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setIsLoading(true);

    try {
      // Note: your current authService.login returns User, but seems to expect token too?
      // If backend sets HTTP-only cookie → you might not need to store token manually
      const user = await authService.login(data);

      // Role-based redirect
      const role = user.role?.toLowerCase();

      if (role === "student") {
        router.push("/dashboard/student");
      } else if (role === "tutor") {
        router.push("/dashboard/tutor");
      } else if (role === "contributor") {
        router.push("/dashboard/contributor");
      } else if (role === "admin" || role === "superadmin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard"); // fallback
      }

      // Optional: only if you're using JWT in localStorage (not recommended with httpOnly cookies)
      // localStorage.setItem("authToken", response.token);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your credentials and try again.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-brand animate-gradient">
          Welcome Back
        </h1>
        <p className="text-text-muted text-base">
          Log in to continue your learning journey
        </p>
      </motion.div>

      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-danger mb-6 flex items-center gap-3"
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <span>Email</span>
            <span className="text-brand">✉️</span>
          </label>
          <div className="relative">
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className={`input pl-10 ${errors.email ? "border-danger focus:ring-danger/30" : ""}`}
              autoComplete="email"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
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
          {errors.email && (
            <p className="text-danger text-sm mt-1 flex items-center gap-1.5">
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

        {/* Password */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <span>Password</span>
            <span className="text-brand">🔐</span>
          </label>
          <div className="relative">
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={`input pl-10 ${errors.password ? "border-danger focus:ring-danger/30" : ""}`}
              autoComplete="current-password"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
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
          {errors.password && (
            <p className="text-danger text-sm mt-1 flex items-center gap-1.5">
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

        <div className="flex justify-between items-center text-sm pt-2">
          <Link href="/forgot-password" className="text-brand hover:text-brand-hover hover:underline">
            Forgot password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="btn btn-brand w-full py-3 text-lg font-medium mt-4 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-brand font-medium hover:text-brand-hover transition-colors hover:underline"
        >
          Create one now
        </Link>
      </p>
    </div>
  );
}