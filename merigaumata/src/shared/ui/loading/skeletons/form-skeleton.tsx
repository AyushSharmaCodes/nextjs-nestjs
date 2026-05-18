'use client';

import React from 'react';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function FormSkeleton() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column - Contact/Sidebar Details Cards */}
      <div className="lg:col-span-4 space-y-6">
        <div className="space-y-4">
          <Skeleton variant="text" width="40%" className="h-4" />
          <Skeleton variant="text" width="90%" className="h-8 font-serif" />
          <Skeleton variant="text" width="75%" className="h-8 font-serif" />
          <SkeletonTextRows count={3} />
        </div>

        {/* Floating details item blocks */}
        <div className="space-y-4 pt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-start gap-4 p-4 rounded-2xl bg-[#F6F3E6]/60 dark:bg-stone-900/30 border border-stone-200/10 dark:border-stone-800/10"
            >
              <Skeleton variant="circular" width={40} height={40} className="flex-shrink-0" />
              <div className="space-y-2 flex-1 pt-1">
                <Skeleton variant="text" width="30%" className="h-3" />
                <Skeleton variant="text" width="70%" className="h-4.5 font-semibold" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Main Dynamic Input Form Panel */}
      <div className="lg:col-span-8">
        <div className="bg-white dark:bg-[#121212]/40 rounded-3xl p-6 md:p-8 border border-stone-200/40 dark:border-stone-850/40 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton variant="text" width="25%" className="h-5" />
            <Skeleton variant="text" width="60%" className="h-7 font-serif" />
          </div>

          <div className="space-y-5 pt-2">
            {/* Input Row 1 - Dual (Name, Email) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Skeleton variant="text" width="35%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="35%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-11 w-full rounded-xl" />
              </div>
            </div>

            {/* Input Row 2 - Dual (Phone, Subject) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Skeleton variant="text" width="35%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="35%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-11 w-full rounded-xl" />
              </div>
            </div>

            {/* Input Row 3 - Textarea (Message) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton variant="text" width="20%" className="h-3.5" />
                <Skeleton variant="text" width="90px" className="h-3.5" />
              </div>
              <Skeleton variant="rectangular" className="h-28 w-full rounded-2xl" />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Skeleton variant="rectangular" width="140px" className="h-11 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
