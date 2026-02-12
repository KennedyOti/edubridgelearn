// frontend/src/app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/hooks/auth';
import AuthFormWrapper from '@/components/auth/AuthFormWrapper';
import InputField from '@/components/auth/InputField';
import FormMessage from '@/components/auth/FormMessage';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Enhanced schema with password strength validation
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  password_confirmation: z.string(),
  role: z
  .string()
  .min(1, 'Please select a role')
  .refine((val) => ['student', 'tutor', 'contributor'].includes(val), {
    message: 'Invalid role selected',
  }),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Role configuration for better maintainability and UX
const ROLE_CONFIG = {
  student: {
    icon: AcademicCapIcon,
    title: 'Student',
    description: 'Access courses, track progress, and earn certificates',
    color: 'blue',
    benefits: ['Personalized learning paths', 'Progress tracking', 'Community access']
  },
  tutor: {
    icon: UserGroupIcon,
    title: 'Tutor',
    description: 'Create courses, mentor students, and earn revenue',
    color: 'purple',
    benefits: ['Course creation tools', 'Revenue sharing', 'Analytics dashboard']
  },
  contributor: {
    icon: PencilSquareIcon,
    title: 'Contributor',
    description: 'Share knowledge, write articles, and build reputation',
    color: 'green',
    benefits: ['Content publishing', 'Community recognition', 'Networking']
  }
} as const;

// Password strength checker component
const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const checks = [
      { regex: /.{8,}/, message: 'At least 8 characters' },
      { regex: /[A-Z]/, message: 'Uppercase letter' },
      { regex: /[a-z]/, message: 'Lowercase letter' },
      { regex: /[0-9]/, message: 'Number' },
      { regex: /[^A-Za-z0-9]/, message: 'Special character' },
    ];

    const passed = checks.filter(check => check.regex.test(password));
    setStrength((passed.length / checks.length) * 100);
    
    const failed = checks
      .filter(check => !check.regex.test(password))
      .map(check => check.message);
    
    setFeedback(failed);
  }, [password]);

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-danger';
    if (strength < 80) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = () => {
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getStrengthColor()} transition-all duration-300`}
            style={{ width: `${strength}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {getStrengthText()}
        </span>
      </div>
      
      {feedback.length > 0 && (
        <div className="text-xs space-y-1">
          {feedback.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <XCircleIcon className="h-3 w-3 text-danger" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
      
      {strength === 100 && (
        <div className="flex items-center gap-1.5 text-xs text-success">
          <CheckCircleIcon className="h-3 w-3" />
          <span>Strong password!</span>
        </div>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: undefined,
      terms: false,
    },
    mode: 'onChange',
  });

  const watchPassword = watch('password', '');
  const watchRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setMessage(null);

    const result = await registerUser(data);

    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: 'Registration successful! Please check your email to verify your account.' 
      });
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setIsLoading(false);
  };

  return (
    <AuthFormWrapper
      title="Create your account"
      subtitle="Join our community of learners, educators, and contributors"
    >
      {message && <FormMessage type={message.type} message={message.text} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Name Field */}
        <div className="space-y-2">
          <div className="relative">
            <InputField
              label="Full Name"
              type="text"
              name="name"
              register={register}
              error={errors.name}
              placeholder="John Doe"
              required
              icon={<UserIcon className="h-5 w-5 text-[var(--text-muted)]" />}
              className="pl-10"
            />
          </div>
          {watch('name') && !errors.name && (
            <p className="text-xs text-success flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              Valid name format
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <div className="relative">
            <InputField
              label="Email Address"
              type="email"
              name="email"
              register={register}
              error={errors.email}
              placeholder="john@example.com"
              required
              icon={<EnvelopeIcon className="h-5 w-5 text-[var(--text-muted)]" />}
              className="pl-10"
            />
          </div>
          {watch('email') && !errors.email && (
            <p className="text-xs text-success flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              Valid email format
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              register={register}
              error={errors.password}
              placeholder="••••••••"
              required
              icon={<LockClosedIcon className="h-5 w-5 text-[var(--text-muted)]" />}
              className="pl-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {watchPassword && <PasswordStrengthMeter password={watchPassword} />}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <div className="relative">
            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="password_confirmation"
              register={register}
              error={errors.password_confirmation}
              placeholder="••••••••"
              required
              icon={<LockClosedIcon className="h-5 w-5 text-[var(--text-muted)]" />}
              className="pl-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {watch('password_confirmation') && watch('password') === watch('password_confirmation') && (
            <p className="text-xs text-success flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              Passwords match
            </p>
          )}
        </div>

        {/* Role Selection - Enhanced Card Layout */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text)]">
            Choose your role <span className="text-danger">*</span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(ROLE_CONFIG) as Array<keyof typeof ROLE_CONFIG>).map((roleKey) => {
              const role = ROLE_CONFIG[roleKey];
              const Icon = role.icon;
              const isSelected = watchRole === roleKey;
              
              return (
                <div
                  key={roleKey}
                  onClick={() => {
                    setValue('role', roleKey, { shouldValidate: true });
                    setSelectedRole(roleKey);
                  }}
                  className={`
                    relative group cursor-pointer rounded-xl border-2 p-4
                    transition-all duration-200 hover:shadow-lg
                    ${isSelected 
                      ? `border-${role.color}-500 bg-${role.color}-50 dark:bg-${role.color}-900/20` 
                      : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                    }
                    ${errors.role ? 'border-danger' : ''}
                  `}
                >
                  {/* Radio indicator */}
                  <div className="absolute top-3 right-3">
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${isSelected 
                        ? `border-${role.color}-500 bg-${role.color}-500` 
                        : 'border-[var(--border)]'
                      }
                    `}>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Icon and title */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`
                      p-2 rounded-lg
                      ${isSelected 
                        ? `bg-${role.color}-100 dark:bg-${role.color}-900/40` 
                        : 'bg-gray-100 dark:bg-gray-800'
                      }
                    `}>
                      <Icon className={`
                        h-5 w-5
                        ${isSelected ? `text-${role.color}-600 dark:text-${role.color}-400` : 'text-[var(--text-muted)]'}
                      `} />
                    </div>
                    <span className={`
                      font-semibold
                      ${isSelected ? `text-${role.color}-600 dark:text-${role.color}-400` : 'text-[var(--text)]'}
                    `}>
                      {role.title}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    {role.description}
                  </p>

                  {/* Benefits */}
                  <ul className="text-xs space-y-1">
                    {role.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <CheckCircleIcon className="h-3 w-3 text-success" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Hidden radio input for form */}
                  <input
                    type="radio"
                    value={roleKey}
                    {...register('role')}
                    className="hidden"
                  />
                </div>
              );
            })}
          </div>
          
          {errors.role && (
            <p className="text-sm text-danger flex items-center gap-1">
              <XCircleIcon className="h-4 w-4" />
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                {...register('terms')}
                className="w-4 h-4 rounded border-[var(--border)] text-primary focus:ring-primary focus:ring-offset-0"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="terms" className="font-medium text-[var(--text)]">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
              {errors.terms && (
                <p className="text-sm text-danger mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-4 w-4" />
                  {errors.terms.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || Object.keys(errors).length > 0 || !isDirty}
          className="
            w-full btn-primary relative overflow-hidden group
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary
            transition-all duration-200
          "
        >
          <span className="relative z-10">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 group-disabled:hidden bg-gradient-to-r from-white/10 to-transparent transition-transform duration-300" />
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </AuthFormWrapper>
  );
}