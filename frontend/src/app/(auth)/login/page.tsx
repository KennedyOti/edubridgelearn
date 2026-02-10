'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/hooks/auth';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import InputField from '@/components/auth/InputField';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const registered = searchParams.get('registered');
    const message = searchParams.get('message');

    if (registered === 'true') {
      setMessage({
        type: 'success',
        text: 'Registration successful! Please verify your email before logging in.',
      });
    }

    if (message === 'pending_approval') {
      setMessage({
        type: 'info',
        text: 'Your account is pending approval. You will be notified once approved.',
      });
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setMessage(null);

    const result = await login(data.email, data.password);
    
    if (!result.success) {
      setMessage({ type: 'error', text: result.error });
    }
    
    setIsLoading(false);
  };

  return (
    <AuthFormWrapper
      title="Welcome Back"
      subtitle="Sign in to your account"
      footerText="Don't have an account?"
      footerLink={{ text: "Sign up", href: "/register" }}
    >
      {message && <FormMessage type={message.type} message={message.text} />}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField
          label="Email Address"
          type="email"
          name="email"
          register={register}
          error={errors.email}
          placeholder="john@example.com"
          required
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          register={register}
          error={errors.password}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
        </button>
      </form>
    </AuthFormWrapper>
  );
}