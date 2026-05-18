import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const isCircular = variant === 'circular';
  const isText = variant === 'text';

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style,
  };

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'animate-pulse bg-neutral-200/60 dark:bg-neutral-800/60',
        isCircular && 'rounded-full',
        isText && 'rounded-[4px] h-[1em]',
        !isCircular && !isText && 'rounded-xl',
        className
      )}
      style={customStyle}
      {...props}
    />
  );
}

/**
 * Convenience helper to render rows of text skeletons for loading states.
 */
export function SkeletonTextRows({
  count = 3,
  className,
  ...props
}: {
  count?: number;
  className?: string;
} & SkeletonProps) {
  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, index) => {
        // Vary widths slightly for visual aesthetic premium feel
        const itemWidths = ['100%', '92%', '85%', '95%', '78%'];
        const currentWidth = itemWidths[index % itemWidths.length];
        
        return (
          <Skeleton
            key={index}
            variant="text"
            width={currentWidth}
            className={className}
            {...props}
          />
        );
      })}
    </div>
  );
}
