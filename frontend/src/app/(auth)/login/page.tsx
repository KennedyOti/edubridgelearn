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
      // Save token to localStorage/sessionStorage (optional) or handle via provider
      localStorage.setItem("authToken", response.token);

      // Redirect based on role
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
    <div className="w-full max-w-md mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back 👋</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Log in and continue your learning quest.
        </p>
      </div>

      {serverError && (
        <div className="mt-4 p-3 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {/* Email */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@futuregenius.com"
            className={`mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none ${
              errors.email ? "border-danger focus:ring-danger/40" : ""
            }`}
          />
          {errors.email && (
            <p className="text-danger text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password")}
            placeholder="Your secret knowledge key"
            className={`mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none ${
              errors.password ? "border-danger focus:ring-danger/40" : ""
            }`}
          />
          {errors.password && (
            <p className="text-danger text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-indigo-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          {isSubmitting ? "Opening your portal..." : "Enter the Portal 🚀"}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-500">
        No account yet?{" "}
        <Link
          href="/register"
          className="text-indigo-600 font-medium hover:underline"
        >
          Join the adventure
        </Link>
      </p>
    </div>
  );
}
