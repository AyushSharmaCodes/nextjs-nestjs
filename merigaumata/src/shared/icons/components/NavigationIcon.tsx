'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';
import { cn } from '@/lib/utils';

export interface NavigationIconProps extends AppIconProps {
  /**
   * Whether the link/item is currently active.
   */
  active?: boolean;
  /**
   * Whether the menu/sidebar is collapsed.
   */
  collapsed?: boolean;
}

export const NavigationIcon = React.forwardRef<SVGSVGElement, NavigationIconProps>(
  ({ active, collapsed, className, variant, ...props }, ref) => {
    return (
      <AppIcon
        ref={ref}
        className={cn(
          'transition-all duration-300',
          active
            ? 'text-primary-600 dark:text-primary-400 scale-105'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
          collapsed && 'mx-auto',
          className
        )}
        variant={variant}
        {...props}
      />
    );
  }
);

NavigationIcon.displayName = 'NavigationIcon';
export default NavigationIcon;
