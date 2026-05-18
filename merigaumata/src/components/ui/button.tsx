import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none font-sans',
          // Variants
          variant === 'default' && 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 shadow',
          variant === 'destructive' && 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-950 dark:text-rose-450 dark:hover:bg-rose-900/80 shadow-sm',
          variant === 'outline' && 'border border-stone-250 bg-white hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-300',
          variant === 'secondary' && 'bg-stone-100 text-stone-900 hover:bg-stone-100/85 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-800/80',
          variant === 'ghost' && 'hover:bg-stone-100 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300',
          variant === 'link' && 'text-stone-900 dark:text-stone-100 underline-offset-4 hover:underline',
          // Sizes
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-8 px-3 rounded-lg',
          size === 'lg' && 'h-11 px-8 rounded-2xl',
          size === 'icon' && 'h-9 w-9',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
