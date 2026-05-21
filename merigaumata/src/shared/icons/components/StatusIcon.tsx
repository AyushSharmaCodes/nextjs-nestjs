'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';
import { cn } from '@/lib/utils';

export interface StatusIconProps extends Omit<AppIconProps, 'name' | 'variant'> {
  /**
   * Semantic status type.
   */
  status: 'success' | 'error' | 'warning' | 'info' | 'verified';
  /**
   * Whether to wrap the icon inside a rounded, themed background badge.
   */
  showBackground?: boolean;
}

const STATUS_MAP = {
  success: { 
    name: 'checkCircle2' as const, 
    variant: 'success' as const, 
    bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
  },
  error: { 
    name: 'alert' as const, 
    variant: 'destructive' as const, 
    bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400' 
  },
  warning: { 
    name: 'alert' as const, 
    variant: 'warning' as const, 
    bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-500' 
  },
  info: { 
    name: 'info' as const, 
    variant: 'info' as const, 
    bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400' 
  },
  verified: { 
    name: 'verified' as const, 
    variant: 'info' as const, 
    bg: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/20 text-blue-500' 
  },
} as const;

export const StatusIcon = React.forwardRef<SVGSVGElement, StatusIconProps>(
  ({ status, showBackground = false, className, size = 'md', ...props }, ref) => {
    const config = STATUS_MAP[status];

    if (showBackground) {
      return (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full p-2 border shrink-0',
            config.bg
          )}
        >
          <AppIcon
            ref={ref}
            name={config.name}
            size={size}
            variant={config.variant}
            className={className}
            {...props}
          />
        </div>
      );
    }

    return (
      <AppIcon
        ref={ref}
        name={config.name}
        size={size}
        variant={config.variant}
        className={className}
        {...props}
      />
    );
  }
);

StatusIcon.displayName = 'StatusIcon';
export default StatusIcon;
