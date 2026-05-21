'use client';

import { logger } from '@/shared/lib/logger';
import React from 'react';
import { motion } from 'motion/react';
import { ICON_REGISTRY } from '../registry';
import { iconVariants } from '../variants/icon.variants';
import { ICON_PIXEL_SIZES } from '../constants/sizes';
import { AppIconProps } from '../types';
import { cn } from '@/lib/utils';

export const AppIcon = React.forwardRef<SVGSVGElement, AppIconProps>(
  (
    {
      name,
      size = 'md',
      variant = 'default',
      strokeWidth,
      decorative = true,
      ariaLabel,
      className,
      animate = false,
      ...props
    },
    ref
  ) => {
    const IconComponent = ICON_REGISTRY[name];

    if (!IconComponent) {
      logger.warn(`Icon "${name}" not found in registry.`);
      return null;
    }

    const pixelSize = ICON_PIXEL_SIZES[size];
    const resolvedStrokeWidth = strokeWidth ?? (size === 'xs' || size === 'sm' ? 2.5 : 2);

    const commonProps = {
      size: pixelSize,
      strokeWidth: resolvedStrokeWidth,
      className: cn(iconVariants({ variant, size }), className),
      'aria-hidden': decorative ? true : undefined,
      'aria-label': !decorative ? ariaLabel : undefined,
      role: !decorative ? 'img' : undefined,
      ...props,
    };

    if (animate) {
      const MotionIcon = motion(IconComponent);
      return (
        <MotionIcon
          {...(commonProps as any)}
          ref={ref as any}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        />
      );
    }

    return <IconComponent ref={ref} {...commonProps} />;
  }
);

AppIcon.displayName = 'AppIcon';
export default AppIcon;
