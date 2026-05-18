'use client';

import React from 'react';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function ProductSkeleton() {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-10">
      {/* Sidebar Filters Skeleton */}
      <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
        <div className="border border-stone-200/40 dark:border-stone-800/40 rounded-2xl p-6 space-y-6 bg-white dark:bg-[#121212]/30">
          <div className="space-y-2">
            <Skeleton variant="text" width="50%" className="h-5" />
            <Skeleton variant="rectangular" className="h-[1px] w-full mt-2" />
          </div>
          
          {/* Categories List Skeleton */}
          <div className="space-y-4 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton variant="text" width={`${50 + (i % 3) * 10}%`} className="h-4" />
                <Skeleton variant="circular" width={20} height={20} />
              </div>
            ))}
          </div>

          <Skeleton variant="rectangular" className="h-[1px] w-full" />

          {/* Price Range Slider Skeleton */}
          <div className="space-y-3">
            <Skeleton variant="text" width="40%" className="h-4" />
            <Skeleton variant="rectangular" className="h-2 w-full rounded-full" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton variant="rectangular" width={60} className="h-8 rounded-lg" />
              <Skeleton variant="rectangular" width={60} className="h-8 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 space-y-6">
        {/* Results Info & Sort bar skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-stone-200/20 dark:border-stone-850/20">
          <Skeleton variant="text" width="120px" className="h-5" />
          <Skeleton variant="rectangular" width="160px" className="h-9 rounded-xl" />
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="group flex flex-col bg-[#F6F3E6] dark:bg-stone-900/60 rounded-3xl overflow-hidden border border-transparent dark:border-stone-800/40 p-4 space-y-4"
            >
              {/* Product Image placeholder */}
              <Skeleton 
                variant="rectangular" 
                className="w-full aspect-square rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/40" 
              />
              
              {/* Title & category */}
              <div className="space-y-2 px-1">
                <Skeleton variant="text" width="40%" className="h-3" />
                <Skeleton variant="text" width="85%" className="h-5 font-serif" />
              </div>

              {/* Rating stars & price rows */}
              <div className="flex justify-between items-center px-1 pt-1">
                <Skeleton variant="text" width="60px" className="h-4" />
                <Skeleton variant="text" width="80px" className="h-6 font-semibold" />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Skeleton variant="rectangular" className="h-10 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
