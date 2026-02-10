// components/auth/ResetPasswordClient.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
const resetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    token: z.string().min(1, 'Reset token is required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/* ---------------------------------------------
   Component
--------------------------------------------- */
export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [emailPreview, setEmailPreview] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  /* ---------------------------------------------
     Extract token + email from URL
  --------------------------------------------- */
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      router.replace('/forgot-password');
      return;
    }

    setValue('token', token);
    setValue('email', email);
    setEmailPreview(email);
  }, [searchParams, router, setValue]);

  /* ---------------------------------------------
     Submit handler
  --------------------------------------------- */
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await authAPI.resetPassword(data);

      setMessage({
        type: 'success',
        text: 'Password reset successful! Redirecting to login…',
      });

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to reset password. Please try again.',
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
      title="Set New Password"
      subtitle={`Reset password for ${emailPreview}`}
    >
      {message && (
        <FormMessage type={message.type} message={message.text} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden fields */}
        <input type="hidden" {...register('token')} />
        <input type="hidden" {...register('email')} />

        <InputField
          label="New Password"
          type="password"
          name="password"
          register={register}
          error={errors.password}
          placeholder="••••••••"
          required
        />

        <InputField
          label="Confirm New Password"
          type="password"
          name="password_confirmation"
          register={register}
          error={errors.password_confirmation}
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
        </button>
      </form>
    </AuthFormWrapper>
  );
}
