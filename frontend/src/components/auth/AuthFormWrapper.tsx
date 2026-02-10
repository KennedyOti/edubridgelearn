import { ReactNode } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="card">
          {children}
        </div>

        {footerText && footerLink && (
          <p className="text-center text-sm text-[var(--text-muted)]">
            {footerText}{' '}
            <Link
              href={footerLink.href}
              className="font-semibold text-primary hover:text-primary-dark"
            >
              {footerLink.text}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}