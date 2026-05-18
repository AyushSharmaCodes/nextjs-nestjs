'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import LoadingText from './loading-text';

interface LoadingOverlayProps {
  message?: string;
  isFullPage?: boolean;
  blur?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingOverlay({
  message,
  isFullPage = false,
  blur = 'sm',
  className,
}: LoadingOverlayProps) {
  const spinnerColor = 'text-[#DE7A41] dark:text-amber-500';
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={message || 'Loading state'}
      className={cn(
        'flex flex-col items-center justify-center z-55 transition-all duration-300 ease-in-out',
        isFullPage 
          ? 'fixed inset-0 w-screen h-screen bg-neutral-50/70 dark:bg-black/75' 
          : 'absolute inset-0 w-full h-full bg-white/60 dark:bg-stone-900/60',
        blur === 'sm' && 'backdrop-blur-[2px]',
        blur === 'md' && 'backdrop-blur-[6px]',
        blur === 'lg' && 'backdrop-blur-[12px]',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/85 dark:bg-[#0c0a09]/90 border border-stone-200/20 dark:border-stone-800/40 shadow-xl max-w-sm text-center">
        {/* Animated Brand Circular Progress Ring */}
        <div className="relative w-12 h-12">
          {/* Inner ring */}
          <svg className="animate-spin w-full h-full" viewBox="0 0 50 50">
            <circle
              className="opacity-20 stroke-neutral-300 dark:stroke-neutral-700"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
            <path
              className={spinnerColor}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              d="M25 5a20 20 0 0 1 20 20"
            />
          </svg>
          {/* Pulsing center brand core */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[#DE7A41] to-amber-500 opacity-80 animate-pulse" />
        </div>

        {/* Loading text feedback */}
        {message && (
          <LoadingText
            message={message}
            variant="primary"
            className="text-sm font-semibold mt-1"
          />
        )}
      </div>
    </div>
  );
}
