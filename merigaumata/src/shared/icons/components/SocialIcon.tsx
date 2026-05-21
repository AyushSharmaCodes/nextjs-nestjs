'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';
import { cn } from '@/lib/utils';

export interface SocialIconProps extends Omit<AppIconProps, 'name' | 'variant'> {
  /**
   * The social media platform.
   */
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
}

const SOCIAL_MAP = {
  facebook: { name: 'facebook' as const, hoverColor: 'hover:text-[#1877F2]' },
  twitter: { name: 'twitter' as const, hoverColor: 'hover:text-[#1DA1F2]' },
  linkedin: { name: 'linkedin' as const, hoverColor: 'hover:text-[#0A66C2]' },
  instagram: { name: 'instagram' as const, hoverColor: 'hover:text-[#E1306C]' },
} as const;

export const SocialIcon = React.forwardRef<SVGSVGElement, SocialIconProps>(
  ({ platform, className, ...props }, ref) => {
    const config = SOCIAL_MAP[platform];
    return (
      <AppIcon
        ref={ref}
        name={config.name}
        className={cn(
          'transition-colors duration-200 text-neutral-500 dark:text-neutral-400', 
          config.hoverColor, 
          className
        )}
        {...props}
      />
    );
  }
);

SocialIcon.displayName = 'SocialIcon';
export default SocialIcon;
