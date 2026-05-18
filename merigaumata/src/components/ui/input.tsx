import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={clsx(
          'flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-stone-400 focus-visible:outline-none focus-visible:border-stone-400 focus-visible:ring-1 focus-visible:ring-stone-900/10 dark:border-stone-800 dark:bg-stone-900 dark:focus-visible:border-stone-600 dark:focus-visible:ring-stone-100/10 text-stone-900 dark:text-stone-100 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
