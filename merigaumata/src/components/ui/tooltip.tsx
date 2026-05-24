import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  // Distribute visibility state to children triggers & contents
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const typeDisplayName = (child.type as { displayName?: string }).displayName;
      // If it's the trigger, pass standard hover handlers
      if (typeDisplayName === 'TooltipTrigger') {
        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          onMouseEnter: () => setIsVisible(true),
          onMouseLeave: () => setIsVisible(false),
          onFocus: () => setIsVisible(true),
          onBlur: () => setIsVisible(false),
        });
      }
      // If it's the content, pass active status
      if (typeDisplayName === 'TooltipContent') {
        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          isVisible,
        });
      }
    }
    return child;
  });

  return <div className="relative inline-block">{childrenWithProps}</div>;
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

interface TooltipChildProps {
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
  onClick?: React.MouseEventHandler;
}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      props.onMouseEnter?.(e);
      if (asChild && React.isValidElement(children)) {
        (children.props as TooltipChildProps).onMouseEnter?.(e);
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      props.onMouseLeave?.(e);
      if (asChild && React.isValidElement(children)) {
        (children.props as TooltipChildProps).onMouseLeave?.(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      props.onFocus?.(e);
      if (asChild && React.isValidElement(children)) {
        (children.props as TooltipChildProps).onFocus?.(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      props.onBlur?.(e);
      if (asChild && React.isValidElement(children)) {
        (children.props as TooltipChildProps).onBlur?.(e);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<TooltipChildProps>, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onClick: (e: React.MouseEvent) => {
          (children.props as TooltipChildProps).onClick?.(e);
        }
      });
    }

    return (
      <div 
        ref={ref} 
        className="inline-block" 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isVisible?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function TooltipContent({
  children,
  isVisible = false,
  className,
  side = 'top',
  ...props
}: TooltipContentProps) {
  if (!isVisible) return null;

  return (
    <div
      {...props}
      className={clsx(
        'absolute mb-1.5 z-50 overflow-hidden rounded-lg bg-stone-900 px-2.5 py-1 text-[10px] font-bold text-white shadow-md animate-in fade-in-50 zoom-in-95 dark:bg-stone-50 dark:text-stone-950 font-sans pointer-events-none select-none min-w-max leading-none',
        side === 'top' && 'bottom-full left-1/2 -translate-x-1/2',
        side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-1.5',
        className
      )}
    >
      {children}
    </div>
  );
}
(TooltipContent as { displayName?: string }).displayName = 'TooltipContent';
