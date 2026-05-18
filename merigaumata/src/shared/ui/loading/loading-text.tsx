'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  message?: string;
  variant?: 'primary' | 'secondary' | 'neutral';
  pulse?: boolean;
}

export default function LoadingText({
  message = 'Loading...',
  variant = 'neutral',
  pulse = true,
  className,
  ...props
}: LoadingTextProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'font-serif font-medium tracking-wide flex items-center gap-1.5',
        pulse && 'animate-pulse',
        variant === 'primary' && 'text-tertiary-700 dark:text-tertiary-300',
        variant === 'secondary' && 'text-secondary-600 dark:text-secondary-400',
        variant === 'neutral' && 'text-neutral-500 dark:text-neutral-400',
        className
      )}
      {...props}
    >
      {message}
      
      {/* Dynamic dot shimmers */}
      {pulse && (
        <span className="inline-flex gap-0.5 ml-0.5">
          <span className="w-1 h-1 rounded-full bg-current animate-bounce delay-0" />
          <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
          <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
        </span>
      )}
    </span>
  );
}
