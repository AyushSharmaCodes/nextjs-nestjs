'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function BlogDetailLoading() {
  const t = useTranslations('loading');

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button and breadcrumb placeholder */}
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" width={75} className="h-6 rounded-md" />
        <Skeleton variant="text" width={100} className="h-4" />
      </div>

      {/* Article Header block */}
      <div className="space-y-4">
        <Skeleton variant="text" width="90%" className="h-10 font-serif" />
        <Skeleton variant="text" width="60%" className="h-10 font-serif" />
        
        {/* Author & Date metadata bar */}
        <div className="flex items-center gap-4 pt-2 border-b border-stone-200/20 dark:border-stone-850/20 pb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-1.5 flex-1">
            <Skeleton variant="text" width="120px" className="h-4" />
            <Skeleton variant="text" width="80px" className="h-3" />
          </div>
        </div>
      </div>

      {/* Large Featured Image Banner */}
      <Skeleton 
        variant="rectangular" 
        className="w-full aspect-[21/9] rounded-3xl bg-neutral-200/40 dark:bg-neutral-800/40" 
      />

      {/* Paragraph 1 */}
      <div className="space-y-4 pt-4">
        <Skeleton variant="text" width="40%" className="h-6 font-semibold" />
        <SkeletonTextRows count={4} />
      </div>

      {/* Paragraph 2 */}
      <div className="space-y-4 pt-4">
        <SkeletonTextRows count={5} />
      </div>
    </div>
  );
}
