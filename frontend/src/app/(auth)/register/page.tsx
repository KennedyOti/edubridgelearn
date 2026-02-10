'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/hooks/auth';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import InputField from '@/components/auth/InputField';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  role: z.enum(['student', 'tutor', 'contributor']),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setMessage(null);

    const result = await registerUser(data);

    if (result.success) {
      setMessage({ type: 'success', text: 'Registration successful! Please check your email to verify your account.' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setIsLoading(false);
  };

  return (
    <AuthFormWrapper
      title="Create Account"
      subtitle="Join our learning community"
      footerText="Already have an account?"
      footerLink={{ text: "Sign in", href: "/login" }}
    >
      {message && <FormMessage type={message.type} message={message.text} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField
          label="Full Name"
          type="text"
          name="name"
          register={register}
          error={errors.name}
          placeholder="John Doe"
          required
        />

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

        <InputField
          label="Confirm Password"
          type="password"
          name="password_confirmation"
          register={register}
          error={errors.password_confirmation}
          placeholder="••••••••"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Role <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['student', 'tutor', 'contributor'].map((role) => (
              <label
                key={role}
                          className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors
                  peer-checked:border-primary peer-checked:bg-primary/20
                  ${errors.role ? 'border-danger' : 'border-[var(--border)]'}
                `}
              >
                <input
                  type="radio"
                  value={role}
                  {...register('role', { required: true })}
                  className="sr-only peer"
                />
                <span className="text-sm font-medium capitalize">{role}</span>
              </label>
            ))}
          </div>

          {errors.role && (
            <p className="text-sm text-danger">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
        </button>
      </form>
    </AuthFormWrapper>
  );
}