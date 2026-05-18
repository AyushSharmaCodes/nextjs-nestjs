'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import LoadingText from './loading-text';

interface RouteLoaderProps {
  visible: boolean;
  message: string;
  delayMs?: number;
  className?: string;
}

export default function RouteLoader({
  visible,
  message,
  delayMs = 150,
  className,
}: RouteLoaderProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let frameId: number;

    if (visible) {
      // Delay mounting/visual entry to prevent flashing for fast transitions
      timer = setTimeout(() => {
        setShouldShow(true);
      }, delayMs);
    } else {
      // Defer state update to next frame to prevent cascading layout rendering
      frameId = requestAnimationFrame(() => {
        setShouldShow(false);
      });
    }

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [visible, delayMs]);

  if (!shouldShow) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-200/40 dark:border-stone-850/40 px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-350 ease-out animate-in fade-in slide-in-from-bottom-5',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Brand accent indicator with infinite heartbeat animation */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>

      {/* Accessible, pulsing label */}
      <LoadingText message={message} className="text-sm font-medium text-stone-600 dark:text-stone-300 select-none font-sans" />
    </div>
  );
}
