import React from 'react';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function CategoriesLoading() {
  return (
    <div className="space-y-6 text-left animate-pulse">
      
      {/* Title Shimmer */}
      <div className="space-y-2 border-b border-earth-100 pb-4">
        <Skeleton variant="text" width="180px" height={12} className="opacity-50" />
        <Skeleton variant="text" width="320px" height={28} />
        <Skeleton variant="text" width="90%" height={14} />
      </div>

      {/* Tabs Shimmer */}
      <div className="flex bg-card border border-earth-200 rounded-2xl p-1 gap-1 max-w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={42} className="flex-1 rounded-xl" />
        ))}
      </div>

      {/* Search Toolbar Shimmer */}
      <div className="bg-card border border-earth-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex gap-3">
          <Skeleton variant="rectangular" height={40} className="flex-1 rounded-xl" />
          <Skeleton variant="rectangular" width={140} height={40} className="rounded-xl" />
        </div>
      </div>

      {/* Tree list hierarchy shimmer */}
      <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 p-4 bg-earth-50 rounded-2xl border border-earth-200 mb-2">
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width="70%" height={12} />
        </div>

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-earth-100/50" style={{ paddingLeft: `${i * 24}px` }}>
            <div className="flex items-center gap-3">
              <Skeleton variant="rectangular" width={16} height={16} className="rounded" />
              <Skeleton variant="circular" width={28} height={28} />
              <div className="space-y-1">
                <Skeleton variant="text" width="120px" height={14} />
                <Skeleton variant="text" width="80px" height={10} />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={24} height={24} className="rounded-lg" />
              <Skeleton variant="rectangular" width={24} height={24} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
