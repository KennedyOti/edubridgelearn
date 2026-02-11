// frontend/src/components/auth/InputField.tsx
import { ReactNode } from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function InputField({
  label,
  type,
  name,
  register,
  error,
  placeholder,
  required,
  icon,
  className = '',
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-[var(--text)]">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        
        <input
          {...register(name)}
          type={type}
          id={name}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-[var(--surface)] border
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-danger focus:ring-danger focus:border-danger' 
              : 'border-[var(--border)] focus:border-primary focus:ring-primary'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            placeholder:text-[var(--text-muted)] placeholder:text-sm
            transition-colors duration-200
            ${className}
          `}
        />
      </div>
      
      {error && (
        <p className="text-sm text-danger mt-1 flex items-center gap-1">
          <span className="font-medium">•</span>
          {error.message}
        </p>
      )}
    </div>
  );
}