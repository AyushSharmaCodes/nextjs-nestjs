'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import LoadingText from './loading-text';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export default function PageLoader({
  message = 'Loading sacred essence...',
  className,
}: PageLoaderProps) {
  return (
    <div
      role="main"
      aria-label="Loading page content"
      className={cn(
        'w-full min-h-[50vh] flex flex-col items-center justify-center gap-6 p-8 transition-colors duration-300',
        className
      )}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Animated logo brand circle */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Double animated rings */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#DE7A41] animate-spin [animation-duration:12s] opacity-35" />
          <div className="absolute inset-1 rounded-full border border-[#1B8057] animate-spin [animation-duration:6s] opacity-25" />
          
          {/* Main spinner SVG */}
          <svg className="animate-spin w-12 h-12 text-[#DE7A41] dark:text-amber-500" viewBox="0 0 50 50">
            <circle
              className="opacity-10 stroke-stone-300 dark:stroke-stone-700"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3.5"
            />
            <path
              className="stroke-[#DE7A41] dark:stroke-amber-500"
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              d="M25 5a20 20 0 0 1 20 20"
            />
          </svg>

          {/* Central static heart of brand color */}
          <div className="absolute w-4 h-4 rounded-full bg-[#DE7A41] dark:bg-amber-500/80 shadow-md animate-pulse" />
        </div>

        {/* Localized loading text */}
        <LoadingText
          message={message}
          variant="primary"
          className="text-base font-semibold text-tertiary-800 dark:text-tertiary-200 mt-2"
        />
      </div>
    </div>
  );
}
