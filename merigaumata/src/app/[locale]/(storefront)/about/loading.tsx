'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function AboutLoading() {
  const t = useTranslations('loading');

  return (
    <div className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* About editorial header */}
      <div className="space-y-4 max-w-2xl">
        <Skeleton variant="text" width="150px" className="h-4.5" />
        <Skeleton variant="text" width="90%" className="h-9 font-serif" />
        <Skeleton variant="text" width="60%" className="h-9 font-serif" />
        <Skeleton variant="text" width="80%" className="h-4" />
      </div>

      {/* Hero wide visual image layout placeholder */}
      <Skeleton 
        variant="rectangular" 
        className="w-full aspect-[21/9] rounded-3xl bg-neutral-200/40 dark:bg-neutral-800/40 shadow-sm" 
      />

      {/* Two columns text layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
        <div className="space-y-4">
          <Skeleton variant="text" width="50%" className="h-6 font-semibold" />
          <SkeletonTextRows count={4} />
        </div>
        <div className="space-y-4">
          <Skeleton variant="text" width="50%" className="h-6 font-semibold" />
          <SkeletonTextRows count={4} />
        </div>
      </div>

      {/* 3 columns key values grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-[#FDFBF7] dark:bg-stone-900/20 border border-stone-200/40 dark:border-stone-850/40 rounded-3xl p-6 space-y-4 shadow-sm"
          >
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" width="65%" className="h-5.5 font-serif" />
            <SkeletonTextRows count={3} />
          </div>
        ))}
      </div>
    </div>
  );
}
