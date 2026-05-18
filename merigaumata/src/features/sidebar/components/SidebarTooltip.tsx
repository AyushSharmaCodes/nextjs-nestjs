"use client";

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

interface SidebarTooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
}

export function SidebarTooltip({
  children,
  content,
  side = 'right',
  align = 'center',
  disabled = false,
}: SidebarTooltipProps) {
  if (disabled) return children;

  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={12}
            className={cn(
              "z-50 overflow-hidden rounded-lg bg-earth-950 px-3 py-1.5 text-xs font-medium text-white shadow-md select-none",
              "animate-in fade-in duration-100 zoom-in-95"
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-earth-950 h-1 w-2" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
