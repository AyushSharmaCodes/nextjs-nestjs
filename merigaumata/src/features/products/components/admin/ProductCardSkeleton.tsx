import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900/60 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden select-none animate-pulse">
      
      {/* Aspect Square Image area Shimmer */}
      <div className="relative aspect-square bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
        {/* Checkbox placeholder */}
        <div className="absolute top-3 left-3 h-4 w-4 rounded bg-stone-200 dark:bg-stone-700" />
        {/* Status badge placeholder */}
        <div className="absolute top-3 right-3 h-5 w-16 rounded-full bg-stone-200 dark:bg-stone-700" />
        
        {/* Logo/Icon shimmer outline */}
        <div className="h-10 w-10 rounded-full bg-stone-200/60 dark:bg-stone-700/60" />
      </div>

      {/* Info card shimmer area */}
      <div className="flex flex-col p-4 gap-3 bg-white dark:bg-stone-900/40 border-t border-stone-100/50 dark:border-stone-800/40">
        {/* Title placeholder */}
        <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-700" />

        {/* Pricing placeholders */}
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-3 w-10 rounded bg-stone-200/50 dark:bg-stone-700/50" />
        </div>

        {/* Metadata placeholder */}
        <div className="flex gap-3 mt-1">
          <div className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-3 w-12 rounded bg-stone-200 dark:bg-stone-700" />
        </div>

        {/* Divider line */}
        <div className="border-t border-stone-100 dark:border-stone-800/80 my-1" />

        {/* Stock tracking placeholders */}
        <div className="flex flex-col gap-2 w-full mt-1">
          <div className="flex justify-between">
            <div className="h-3 w-14 rounded bg-stone-200 dark:bg-stone-700" />
            <div className="h-4 w-12 rounded-full bg-stone-200 dark:bg-stone-700" />
          </div>
          <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-stone-200 dark:bg-stone-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
