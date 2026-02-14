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
  const [emailSent, setEmailSent] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Two-step: 1 = role, 2 = details

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

  const nextStep = () => {
    if (!selectedRole) return;
    setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    setServerError("");

    try {
      await authService.register(data);
      setEmailSent(true);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Something unexpected happened. Even servers have moods."
      );
    }
  };

  // Email sent confirmation
  if (emailSent) {
    return (
      <div className="text-center space-y-6 p-6 bg-surface dark:bg-surface rounded-2xl shadow-sm transition-theme">
        <h2 className="text-2xl font-bold gradient-brand">Almost There! 🚀</h2>
        <p className="text-text-muted">
          We’ve sent a verification link to your email. 📬 <br />
          Click it to activate your account and start your learning adventure.
        </p>
        <p className="text-sm text-text-muted">
          Didn’t get the email?{" "}
          <Link
            href="/auth/verify-email/resend"
            className="text-brand hover:underline"
          >
            Resend the verification link
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold gradient-brand">
            Pick Your Role 🎯
          </h2>
          <p className="text-text-muted text-sm">
            Your learning journey starts here. Choose wisely!
          </p>

          <RoleSelector
            value={selectedRole || ""}
            onChange={(role) => setValue("role", role, { shouldValidate: true })}
          />
          {errors.role && (
            <p className="text-danger text-sm mt-2">{errors.role.message}</p>
          )}

          <button
            type="button"
            onClick={nextStep}
            disabled={!selectedRole}
            className="btn btn-brand w-full mt-4 disabled:opacity-60"
          >
            Next ➡️
          </button>
        </div>
      )}

      {/* Step 2: Registration Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold gradient-brand text-center">
            Fill Your Details ✨
          </h2>

          {serverError && (
            <div className="alert alert-danger text-sm">{serverError}</div>
          )}

          {/* Name */}
          <div>
            <label className="label">Your Name 👀</label>
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
            <label className="label">Email 📬</label>
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

          {/* Password */}
          <div>
            <label className="label">Password 🔐</label>
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
            <label className="label">Confirm Password ✨</label>
            <input
              type="password"
              {...register("password_confirmation")}
              className={`input ${errors.password_confirmation ? "border-danger focus:ring-danger/40" : ""}`}
              placeholder="Repeat it carefully..."
            />
            {errors.password_confirmation && (
              <p className="text-danger text-sm mt-1">{errors.password_confirmation.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-brand w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

          <p className="text-sm text-center text-text-muted">
            Already part of the ecosystem?{" "}
            <Link
              href="/auth/login"
              className="text-brand font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      )}
    </form>
  );
}
