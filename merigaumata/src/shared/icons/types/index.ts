import React from 'react';
import { ICON_REGISTRY } from '../registry';

export type IconName = keyof typeof ICON_REGISTRY;

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type IconVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'muted' 
  | 'destructive' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'brand';

export interface AppIconProps extends Omit<React.ComponentPropsWithoutRef<'svg'>, 'name'> {
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
   * Override default stroke width (normally 2 or 2.5).
   */
  strokeWidth?: number;
  /**
   * Mark as purely decorative. If true, adds aria-hidden="true".
   * If false, must provide ariaLabel.
   */
  decorative?: boolean;
  /**
   * Accessible description of the icon for screen readers (if not decorative).
   */
  ariaLabel?: string;
  /**
   * Whether to support hover animations.
   */
  animate?: boolean;
}
