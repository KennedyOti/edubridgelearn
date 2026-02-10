import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      {children}
    </div>
  );
}