interface FormMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function FormMessage({ type, message }: FormMessageProps) {
  const styles = {
    success: 'bg-secondary/10 text-secondary border border-secondary/20',
    error: 'bg-danger/10 text-danger border border-danger/20',
    info: 'bg-primary/10 text-primary border border-primary/20',
  };

  return (
    <div className={`p-3 rounded-lg ${styles[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}