import React from 'react';

export function NotificationSkeleton() {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 bg-card border border-earth-100 dark:border-earth-800/80 rounded-[16px] animate-pulse"
        >
          <div className="h-5 w-5 bg-earth-200/80 dark:bg-earth-800 rounded-[6px]" />
          <div className="h-10 w-10 bg-earth-200/80 dark:bg-earth-800 rounded-full" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-earth-200/80 dark:bg-earth-800 rounded w-1/4" />
            <div className="h-3 bg-earth-200/80 dark:bg-earth-800 rounded w-2/3" />
          </div>
          <div className="h-4 bg-earth-200/80 dark:bg-earth-800 rounded w-16" />
          <div className="h-5 w-5 bg-earth-200/80 dark:bg-earth-800 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function NotificationItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3.5 border-b border-earth-100/60 dark:border-earth-800/60 animate-pulse">
      <div className="h-9 w-9 bg-earth-200/80 dark:bg-earth-800 rounded-full" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="h-3.5 bg-earth-200/80 dark:bg-earth-800 rounded w-1/3" />
        <div className="h-3 bg-earth-200/80 dark:bg-earth-800 rounded w-2/3" />
      </div>
      <div className="h-3.5 bg-earth-200/80 dark:bg-earth-800 rounded w-8" />
    </div>
  );
}
