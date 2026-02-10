import { UseFormRegister, FieldError } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
}

export default function InputField({
  label,
  type,
  name,
  register,
  error,
  placeholder,
  required = false,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register(name, { required })}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? 'border-danger' : 'border-[var(--border)]'
        } bg-transparent`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-sm text-danger">{error.message}</p>
      )}
    </div>
  );
}