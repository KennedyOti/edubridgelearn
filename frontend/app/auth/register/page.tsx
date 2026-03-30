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
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, BookOpen, PenTool } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    password_confirmation: z.string(),
    role: z.enum(["student", "tutor", "contributor"]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const roles = [
  {
    value: "student" as const,
    label: "Student",
    description: "I want to learn and access tutoring",
    icon: GraduationCap,
    color: "border-primary bg-primary-50 text-primary",
  },
  {
    value: "tutor" as const,
    label: "Tutor",
    description: "I want to teach and offer tutoring",
    icon: BookOpen,
    color: "border-secondary bg-secondary/10 text-secondary",
  },
  {
    value: "contributor" as const,
    label: "Contributor",
    description: "I want to create and sell resources",
    icon: PenTool,
    color: "border-accent bg-accent/10 text-accent",
  },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") as "student" | "tutor" | "contributor" | null;
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole || "student",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    try {
      await registerUser(data);
      const user = useAuthStore.getState().user;
      if (user?.role === "student") {
        router.push("/onboarding");
      } else if (user?.role === "tutor") {
        router.push("/tutor/setup");
      } else if (user?.role === "contributor") {
        router.push("/contributor/setup");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const respErrors = error.response?.data?.errors;
      if (respErrors && typeof respErrors === "object" && !Array.isArray(respErrors)) {
        const firstKey = Object.keys(respErrors)[0];
        setError(respErrors[firstKey]?.[0] || "Registration failed.");
      } else {
        setError(error.response?.data?.message || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-muted-foreground mt-1">Join thousands of learners on EduBridge</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Role selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">I am a...</label>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setValue("role", role.value)}
                className={`relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedRole === role.value
                    ? role.color
                    : "border-border bg-white hover:border-muted-foreground/30"
                }`}
              >
                <role.icon className="w-6 h-6" />
                <span className="text-xs sm:text-sm font-semibold">{role.label}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block text-center leading-tight">
                  {role.description}
                </span>
              </button>
            ))}
          </div>
          {errors.role && <p className="mt-1 text-xs text-error">{errors.role.message}</p>}
        </div>

        <Input
          {...register("name")}
          id="name"
          label="Full Name"
          placeholder="John Doe"
          icon={<User className="w-4 h-4" />}
          error={errors.name?.message}
        />

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
            placeholder="Create a strong password"
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

        <Input
          {...register("password_confirmation")}
          id="password_confirmation"
          type="password"
          label="Confirm Password"
          placeholder="Repeat your password"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password_confirmation?.message}
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            required
            className="w-4 h-4 rounded border-input accent-primary mt-0.5"
          />
          <span className="text-xs text-muted-foreground">
            I agree to the{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </span>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-muted-foreground">or sign up with</span>
        </div>
      </div>

      {/* Social signup */}
      <div className="grid grid-cols-3 gap-3">
        {["google", "github", "apple"].map((provider) => (
          <button
            key={provider}
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/social/${provider}`;
            }}
            className="flex items-center justify-center h-11 rounded-xl border border-border bg-white hover:bg-muted transition-colors capitalize text-sm font-medium cursor-pointer"
          >
            {provider}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary font-semibold hover:text-primary-dark">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
