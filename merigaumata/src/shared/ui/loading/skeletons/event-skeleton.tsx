'use client';

import React from 'react';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function EventSkeleton() {
  return (
    <div className="space-y-12">
      {/* Event Header Segment */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <Skeleton variant="text" width="20%" className="h-4.5 mx-auto" />
        <Skeleton variant="text" width="55%" className="h-8 font-serif mx-auto" />
        <Skeleton variant="text" width="85%" className="h-4.5 mx-auto" />
      </div>

      {/* Events Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className="flex flex-col sm:flex-row bg-[#FDFBF7] dark:bg-[#1c1917]/20 rounded-3xl overflow-hidden border border-stone-200/40 dark:border-stone-850/30 shadow-md p-5 gap-6"
          >
            {/* Event visual hero or poster banner placeholder */}
            <div className="w-full sm:w-44 h-44 flex-shrink-0 relative">
              <Skeleton 
                variant="rectangular" 
                className="w-full h-full rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/40" 
              />
              
              {/* Floating Date Badge skeleton */}
              <div className="absolute top-3 left-3 bg-white/95 dark:bg-stone-900/95 p-2 rounded-xl flex flex-col items-center justify-center w-12 h-12 shadow-sm border border-stone-100/50 dark:border-stone-800/60">
                <Skeleton variant="text" width="80%" className="h-3" />
                <Skeleton variant="text" width="60%" className="h-4.5 mt-1 font-bold" />
              </div>
            </div>

            {/* Event Description details section */}
            <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
              <div className="space-y-3">
                {/* Meta details list (time, location) */}
                <div className="flex items-center gap-3">
                  <Skeleton variant="rectangular" width={55} className="h-5 rounded-md" />
                  <Skeleton variant="rectangular" width={75} className="h-5 rounded-md" />
                </div>
                
                {/* Heading */}
                <Skeleton variant="text" width="90%" className="h-6 font-serif" />
                
                {/* Snippet summary */}
                <SkeletonTextRows count={2} />
              </div>

              {/* Action Trigger button */}
              <div className="flex justify-between items-center pt-2">
                <Skeleton variant="text" width="110px" className="h-4" />
                <Skeleton variant="rectangular" width="90px" className="h-8.5 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
