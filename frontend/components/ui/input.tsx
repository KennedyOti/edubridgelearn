"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              icon && "pl-10",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
