'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';

export interface PaymentIconProps extends Omit<AppIconProps, 'name'> {
  /**
   * The payment provider name.
   */
  provider?: string;
}

export const PaymentIcon = React.forwardRef<SVGSVGElement, PaymentIconProps>(
  ({ provider = '', ...props }, ref) => {
    // Currently fallback to creditCard; can map to custom SVGs for Visa, GPay etc. if added
    return <AppIcon ref={ref} name="creditCard" {...props} />;
  }
);

PaymentIcon.displayName = 'PaymentIcon';
export default PaymentIcon;
