'use client';

import React from 'react';

interface ShippingBannerProps {
  className?: string;
  sticky?: boolean;
}

export function ShippingBanner({ className = '', sticky = false }: ShippingBannerProps) {
  return (
    <div 
      className={`bg-[#2E1F30] text-[#FAF9F6] py-3.5 text-center text-[10px] sm:text-xs font-black tracking-[0.25em] uppercase px-4 z-30 flex items-center justify-center gap-2 transition-colors ${
        sticky ? 'sticky top-0' : ''
      } ${className}`}
    >
      <span>⚡ FREE DOMESTIC SHIPPING ON ORDERS OVER ₹1000 ⚡</span>
    </div>
  );
}
