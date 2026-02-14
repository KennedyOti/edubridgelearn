"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/lib/services/auth.service";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { resetPasswordSchema } from "@/lib/validators/auth.schema";



type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setSuccessMessage("");

    try {
      await authService.resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      setSuccessMessage("Your password has been updated successfully! 🚀");
      setTimeout(() => {
        router.push("/login");
      }, 2000); // redirect after 2s
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Even servers have off days."
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center">Choose a New Password 🔑</h1>

      {serverError && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/20 p-3 rounded-lg mt-4">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="text-sm text-green-700 bg-green-100 border border-green-200 p-3 rounded-lg mt-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="label">New Password 🔐</label>
          <input
            type="password"
            placeholder="Enter your new secure password"
            className={`input ${errors.password ? "border-danger focus:ring-danger/40" : ""}`}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-danger text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="label">Confirm Password ✨</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className={`input ${
              errors.password_confirmation ? "border-danger focus:ring-danger/40" : ""
            }`}
            {...register("password_confirmation")}
          />
          {errors.password_confirmation && (
            <p className="text-danger text-sm mt-1">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brand w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Updating your universe..." : "Update Password 🔑"}
        </button>
      </form>
    </div>
  );
}
