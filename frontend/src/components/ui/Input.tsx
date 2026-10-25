// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs text-gray-500 font-medium">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-colors
            ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-green-500'} 
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';