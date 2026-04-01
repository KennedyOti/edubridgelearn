"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      if (!user) return;

      if (user.role === "admin" || user.role === "super_admin") {
        // Admin accounts must use the dedicated admin portal
        await useAuthStore.getState().logout();
        setError("Admin accounts must sign in via the Admin Portal.");
        return;
      } else if (user.role === "student") {
        router.push(user.student_profile?.onboarding_completed ? "/dashboard" : "/onboarding");
      } else if (user.role === "tutor") {
        // Route to setup only if they haven't filled in their profile yet
        router.push(user.tutor_profile?.bio ? "/dashboard" : "/tutor/setup");
      } else if (user.role === "contributor") {
        // Route to setup only if they haven't filled in their profile yet
        router.push(user.contributor_profile?.bio ? "/dashboard" : "/contributor/setup");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { message: string }[] } } };
      setError(error.response?.data?.errors?.[0]?.message || "Login failed. Please try again.");
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/social/${provider}`;
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Log in to continue your learning journey</p>
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

        <div className="relative">
          <Input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-input accent-primary" />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Log In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-muted-foreground">or continue with</span>
        </div>
      </div>

      {/* Social logins */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-white hover:bg-muted transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-medium text-foreground hidden sm:inline">Google</span>
        </button>
        <button
          onClick={() => handleSocialLogin("github")}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-white hover:bg-muted transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-foreground hidden sm:inline">GitHub</span>
        </button>
        <button
          onClick={() => handleSocialLogin("apple")}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-white hover:bg-muted transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="text-sm font-medium text-foreground hidden sm:inline">Apple</span>
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary font-semibold hover:text-primary-dark">
          Sign up for free
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Administrator?{" "}
        <Link href="/admin/login" className="text-muted-foreground underline hover:text-foreground">
          Sign in to the Admin Portal
        </Link>
      </p>
    </div>
  );
}
