'use client';

import React from 'react';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function BlogSkeleton() {
  return (
    <div className="space-y-12">
      {/* Blog list header segment */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <Skeleton variant="text" width="30%" className="h-4 mx-auto" />
        <Skeleton variant="text" width="60%" className="h-8 font-serif mx-auto" />
        <Skeleton variant="text" width="90%" className="h-4 mx-auto" />
      </div>

      {/* Main articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="flex flex-col bg-white dark:bg-[#121212]/30 rounded-3xl overflow-hidden border border-stone-200/40 dark:border-stone-800/40 shadow-sm p-4 space-y-4"
          >
            {/* Blog Post Thumbnail Banner */}
            <Skeleton 
              variant="rectangular" 
              className="w-full aspect-[16/10] rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/40" 
            />

            {/* Date Tag Placeholder */}
            <div className="flex items-center gap-2 px-1 pt-1">
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width="80px" className="h-4.5" />
            </div>

            {/* Title & short description */}
            <div className="space-y-3 px-1 flex-1">
              <Skeleton variant="text" width="95%" className="h-6 font-serif" />
              <Skeleton variant="text" width="70%" className="h-6 font-serif" />
              <div className="pt-2">
                <SkeletonTextRows count={3} />
              </div>
            </div>

            {/* Footer link trigger */}
            <div className="pt-4 border-t border-stone-100/50 dark:border-stone-900/60 flex justify-between items-center px-1">
              <Skeleton variant="text" width="90px" className="h-4" />
              <Skeleton variant="circular" width={28} height={28} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
