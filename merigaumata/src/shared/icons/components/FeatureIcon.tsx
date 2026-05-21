'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';
import { cn } from '@/lib/utils';

export interface FeatureIconProps extends AppIconProps {
  /**
   * The geometry of the background shape wrapper.
   */
  shape?: 'circle' | 'square' | 'squircle';
  /**
   * Style overrides for the outer wrapper container.
   */
  containerClassName?: string;
}

export const FeatureIcon = React.forwardRef<SVGSVGElement, FeatureIconProps>(
  ({ shape = 'circle', containerClassName, className, name, size = 'lg', variant = 'primary', ...props }, ref) => {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center p-4 border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md shrink-0',
          shape === 'circle' && 'rounded-full',
          shape === 'square' && 'rounded-xl',
          shape === 'squircle' && 'rounded-[1.5rem]',
          containerClassName
        )}
      >
        <AppIcon
          ref={ref}
          name={name}
          size={size}
          variant={variant}
          className={className}
          {...props}
        />
      </div>
    );
  }
);

FeatureIcon.displayName = 'FeatureIcon';
export default FeatureIcon;
