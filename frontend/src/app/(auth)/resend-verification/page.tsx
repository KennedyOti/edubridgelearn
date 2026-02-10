'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authAPI } from '@/lib/api/auth';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import InputField from '@/components/auth/InputField';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import Link from 'next/link';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;

export default function ResendVerificationPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const onSubmit = async (data: ResendVerificationFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Note: The actual resend endpoint requires authentication
      // For unauthenticated resend, you might need a different endpoint
      // or you can call login first, then resend
      
      // For now, let's assume we have an unauthenticated endpoint
      // You'll need to create this in Laravel
      await authAPI.resendVerificationToEmail(data.email);
      
      setMessage({
        type: 'success',
        text: 'Verification email has been resent. Please check your inbox.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to resend verification email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Resend Verification Email"
      subtitle="Enter your email to receive a new verification link"
      footerText="Remember your password?"
      footerLink={{ text: "Sign in", href: "/login" }}
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

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Resend Verification Email'}
          </button>
          
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary-dark"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </form>
    </AuthFormWrapper>
  );
}