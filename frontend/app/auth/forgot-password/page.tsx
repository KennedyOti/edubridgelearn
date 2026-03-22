"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setError("");
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { message: string }[] } } };
      setError(error.response?.data?.errors?.[0]?.message || "Failed to send reset link.");
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
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
        </p>
        <Link href="/auth/login">
          <Button variant="ghost" className="mt-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
        <p className="text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("email")}
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        <Link href="/auth/login" className="text-primary font-semibold hover:text-primary-dark inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Back to login
        </Link>
      </p>
    </div>
  );
}
