// src/components/ui/AppButton.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'positive' | 'ghost' | 'danger';
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export const AppButton = ({
  variant = 'primary',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[var(--color-accent-primary)] text-white hover:opacity-90',
    positive:
      'bg-[var(--color-bg-positive)] text-[var(--color-text-primary)] hover:opacity-90',
    ghost:
      'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
    danger: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-spin text-lg">↻</span> : icon}
      {children}
    </button>
  );
};