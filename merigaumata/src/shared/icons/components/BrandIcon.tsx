'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';
import { cn } from '@/lib/utils';

export interface BrandIconProps extends AppIconProps {}

export const BrandIcon = React.forwardRef<SVGSVGElement, BrandIconProps>(
  ({ className, variant = 'brand', ...props }, ref) => {
    return (
      <AppIcon
        ref={ref}
        variant={variant}
        className={cn('drop-shadow-sm', className)}
        {...props}
      />
    );
  }
);

BrandIcon.displayName = 'BrandIcon';
export default BrandIcon;
