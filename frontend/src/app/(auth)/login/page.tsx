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

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const response = await authService.login(data);
      localStorage.setItem("authToken", response.token);

      const role = response.user.role;
      if (role === "student") router.push("/dashboard/student");
      else if (role === "tutor") router.push("/dashboard/tutor");
      else if (role === "contributor") router.push("/dashboard/contributor");
      else router.push("/dashboard/admin");
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Oops! Something went wrong. Try again."
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Log in and continue your learning quest.
        </p>
      </div>

      {serverError && <div className="alert alert-danger">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {/* Email */}
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@futuregenius.com"
            className={`input ${errors.email ? "border-danger focus:ring-danger/40" : ""}`}
          />
          {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            {...register("password")}
            placeholder="Your secret knowledge key"
            className={`input ${errors.password ? "border-danger focus:ring-danger/40" : ""}`}
          />
          {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Forgot password */}
        <div className="flex justify-between text-sm">
          <Link href="/forgot-password" className="text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-brand w-full flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : null}
          {isSubmitting ? "Opening your portal..." : "Enter the Portal"}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-text-muted">
        No account yet?{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          Join the adventure
        </Link>
      </p>
    </div>
  );
}
