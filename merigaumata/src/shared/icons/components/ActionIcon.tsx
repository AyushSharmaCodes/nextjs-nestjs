'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { IconName, IconSize, IconVariant } from '../types';
import { cn } from '@/lib/utils';

export interface ActionIconProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'name'> {
  /**
   * The registered name of the icon.
   */
  name: IconName;
  /**
   * Semantic size token.
   */
  size?: IconSize;
  /**
   * Semantic color / styling variant.
   */
  variant?: IconVariant;
  /**
   * Override default stroke width.
   */
  strokeWidth?: number;
  /**
   * Accessible label for screen readers. Required for interactive icons.
   */
  ariaLabel: string;
  /**
   * Additional class names for the button wrapper.
   */
  buttonClassName?: string;
  /**
   * Optional tooltip/title text. Falls back to ariaLabel if not provided.
   */
  tooltip?: string;
  /**
   * Whether to support hover animations.
   */
  animate?: boolean;
}

export const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
  (
    {
      name,
      size = 'md',
      variant = 'default',
      strokeWidth,
      ariaLabel,
      className,
      onClick,
      type = 'button',
      disabled = false,
      buttonClassName,
      tooltip,
      animate = true,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        title={tooltip || ariaLabel}
        className={cn(
          'inline-flex items-center justify-center p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-neutral-100 dark:hover:bg-neutral-850/60',
          buttonClassName
        )}
      >
        <AppIcon
          name={name}
          size={size}
          variant={variant}
          strokeWidth={strokeWidth}
          decorative={true}
          className={className}
          animate={animate}
        />
      </button>
    );
  }
);

ActionIcon.displayName = 'ActionIcon';
export default ActionIcon;
