'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';
import { cn } from '@/lib/utils';

export interface NotificationIconProps extends AppIconProps {
  /**
   * Shows a pulsing unread indicator dot at the top-right corner.
   */
  unread?: boolean;
  /**
   * The notification type (influences choice of icon and variant).
   */
  type?: 'alert' | 'message' | 'system';
}

export const NotificationIcon = React.forwardRef<HTMLDivElement, NotificationIconProps>(
  ({ unread, type = 'system', className, size = 'md', name: _unusedName, ...props }, ref) => {
    let name: 'bell' | 'alert' | 'mail' = 'bell';
    let variant: 'default' | 'warning' | 'primary' = 'default';

    if (type === 'alert') {
      name = 'alert';
      variant = 'warning';
    } else if (type === 'message') {
      name = 'mail';
      variant = 'primary';
    }

    return (
      <div ref={ref} className="relative inline-flex shrink-0">
        <AppIcon 
          name={name} 
          size={size} 
          variant={variant} 
          className={className} 
          {...props} 
        />
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </div>
    );
  }
);

NotificationIcon.displayName = 'NotificationIcon';
export default NotificationIcon;
