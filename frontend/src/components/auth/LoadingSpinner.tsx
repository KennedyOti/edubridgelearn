interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizes[size]}`} />
  );
}