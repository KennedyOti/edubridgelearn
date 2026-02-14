"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validators/auth.schema";
import { z } from "zod";
import { authService } from "@/lib/services/auth.service";
import { useState } from "react";
import RoleSelector from "./RoleSelector";
import Link from "next/link";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [serverError, setServerError] = useState("");
  const [emailSent, setEmailSent] = useState(false); // New state

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setServerError("");

    try {
      await authService.register(data);
      // Instead of immediate push, show a confirmation message
      setEmailSent(true);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message ||
          "Something unexpected happened. Even servers have moods."
      );
    }
  };

  // If email sent, show confirmation instead of form
  if (emailSent) {
    return (
      <div className="text-center space-y-6 p-6 bg-white dark:bg-surface rounded-xl shadow-md">
        <h2 className="text-2xl font-bold gradient-text">Almost There! 🚀</h2>
        <p className="text-gray-500">
          We’ve sent a verification link to your email. 📬 <br />
          Click it to activate your account and start your learning adventure.
        </p>
        <p className="text-sm text-gray-400">
          Didn’t get the email? Check your spam folder or{" "}
          <Link
            href="/auth/verify-email/resend"
            className="text-indigo-600 hover:underline"
          >
            resend the verification link
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gradient-text">
          Join EduBridgeLearn 🚀
        </h2>
        <p className="text-sm text-gray-500">
          Pick your role. Shape your journey. No pressure. Greatness loads gradually.
        </p>
      </div>

      {serverError && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/20 p-3 rounded-lg">
          {serverError}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="label">What should we call you? 👀</label>
        <input
          {...register("name")}
          className={`input ${errors.name ? "border-danger focus:ring-danger/40" : ""}`}
          placeholder="Future Legend..."
        />
        {errors.name && (
          <p className="text-danger text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="label">Your academic email 📬</label>
        <input
          type="email"
          {...register("email")}
          className={`input ${errors.email ? "border-danger focus:ring-danger/40" : ""}`}
          placeholder="genius@example.com"
        />
        {errors.email && (
          <p className="text-danger text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Role Selector */}
      <div>
        <RoleSelector
          value={selectedRole || ""}
          onChange={(role) => setValue("role", role, { shouldValidate: true })}
        />
        {errors.role && (
          <p className="text-danger text-sm mt-2">{errors.role.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="label">Secret knowledge key 🔐</label>
        <input
          type="password"
          {...register("password")}
          className={`input ${errors.password ? "border-danger focus:ring-danger/40" : ""}`}
          placeholder="Minimum 8 characters"
        />
        {errors.password && (
          <p className="text-danger text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="label">Confirm the magic spell ✨</label>
        <input
          type="password"
          {...register("password_confirmation")}
          className={`input ${errors.password_confirmation ? "border-danger focus:ring-danger/40" : ""}`}
          placeholder="Repeat it carefully..."
        />
        {errors.password_confirmation && (
          <p className="text-danger text-sm mt-1">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-brand w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Creating your universe...
          </>
        ) : (
          "Create My Account 🎓"
        )}
      </button>

      <p className="text-sm text-center text-gray-500">
        Already part of the ecosystem?{" "}
        <Link
          href="/auth/login"
          className="text-brand font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
