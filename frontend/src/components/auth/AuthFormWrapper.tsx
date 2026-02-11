// frontend/src/components/auth/AuthFormWrapper.tsx
import { ReactNode } from 'react';
import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface AuthFormWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

export default function AuthFormWrapper({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
}: AuthFormWrapperProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
              <SparklesIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          
          {subtitle && (
            <p className="mt-3 text-lg text-[var(--text-muted)] max-w-md mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl blur-2xl -z-10" />
          
          {/* Card */}
          <div className="bg-[var(--surface)] backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-xl p-6 sm:p-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        {footerText && footerLink && (
          <p className="text-center text-sm text-[var(--text-muted)]">
            {footerText}{' '}
            <Link
              href={footerLink.href}
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              {footerLink.text}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}