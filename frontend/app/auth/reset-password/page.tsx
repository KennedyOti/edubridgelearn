"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { Lock, CheckCircle } from "lucide-react";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    setError("");
    setIsLoading(true);
    try {
      await resetPassword({
        email,
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { message: string }[] } } };
      setError(error.response?.data?.errors?.[0]?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Password reset!</h1>
        <p className="text-muted-foreground mt-2">
          Your password has been reset successfully. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="text-muted-foreground mt-1">Create a new secure password for your account</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("password")}
          id="password"
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
        />

        <Input
          {...register("password_confirmation")}
          id="password_confirmation"
          type="password"
          label="Confirm New Password"
          placeholder="Repeat your new password"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password_confirmation?.message}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Reset Password
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        <Link href="/auth/login" className="text-primary font-semibold hover:text-primary-dark">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
