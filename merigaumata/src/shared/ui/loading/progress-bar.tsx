'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  visible: boolean;
  className?: string;
}

export default function ProgressBar({ progress, visible, className }: ProgressBarProps) {
  const [delayedVisible, setDelayedVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let frameId: number;

    if (visible) {
      // Defer state update to next frame to prevent cascading layout rendering
      frameId = requestAnimationFrame(() => {
        setDelayedVisible(true);
      });
    } else {
      // Small fade-out delay to allow 100% state to be fully visible before disappearing
      timeout = setTimeout(() => {
        setDelayedVisible(false);
      }, 400);
    }
    
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameId);
    };
  }, [visible]);

  if (!delayedVisible) return null;

  return (
    <div
      role="progressbar"
      aria-busy={visible}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className={cn(
        'fixed top-0 left-0 right-0 h-[3.5px] z-[9999] pointer-events-none transition-opacity duration-300 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {/* Native keyframes block to keep the component compiler-agnostic */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes progress-shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .animate-progress-shimmer {
              animation: progress-shimmer 1.8s infinite linear;
              background-size: 200% 100%;
            }
          `,
        }}
      />
      {/* Background track indicator */}
      <div 
        className="h-full bg-gradient-to-r from-amber-500 via-[#DE7A41] to-[#1B8057] transition-all duration-300 ease-out relative shadow-[0_1px_8px_rgba(222,122,65,0.4)]"
        style={{ width: `${progress}%` }}
      >
        {/* Shimmer overlay effect */}
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.45)_50%,transparent_100%)] animate-progress-shimmer" />
        {/* Glowing tip indicator */}
        <div className="absolute right-0 top-0 h-full w-[100px] bg-white opacity-80 blur-[3px] shadow-[0_0_8px_#fff]" />
      </div>
    </div>
  );
}
