// app/(auth)/forgot-password/ForgotPasswordClient.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { authAPI } from '@/lib/api/auth';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import InputField from '@/components/auth/InputField';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

/* ---------------------------------------------
   Schema
--------------------------------------------- */
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/* ---------------------------------------------
   Component
--------------------------------------------- */
export default function ForgotPasswordClient() {
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  /* ---------------------------------------------
     Submit handler
  --------------------------------------------- */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await authAPI.forgotPassword(data);

      setMessage({
        type: 'success',
        text: 'Password reset link has been sent to your email.',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to send reset link',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------
     Render
  --------------------------------------------- */
  return (
    <AuthFormWrapper
      title="Reset Password"
      subtitle="Enter your email to receive a reset link"
      footerText="Remember your password?"
      footerLink={{ text: 'Sign in', href: '/login' }}
    >
      {message && (
        <FormMessage type={message.type} message={message.text} />
      )}

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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </AuthFormWrapper>
  );
}
