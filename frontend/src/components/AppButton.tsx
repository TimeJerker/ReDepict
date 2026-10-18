// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export const AppButton  = ({
  variant = 'primary',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-green-500 text-white hover:bg-green-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
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