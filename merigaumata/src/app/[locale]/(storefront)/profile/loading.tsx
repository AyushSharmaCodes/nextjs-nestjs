'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function ProfileLoading() {
  const t = useTranslations('loading');

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Page Title */}
      <div className="space-y-2">
        <Skeleton variant="text" width="160px" className="h-7 font-serif" />
        <Skeleton variant="text" width="300px" className="h-4" />
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left - Account Navigation Links List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-stone-900/30 rounded-3xl p-5 border border-stone-200/40 dark:border-stone-800/40 shadow-sm space-y-6">
            
            {/* User Profile Avatar Card */}
            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-stone-100 dark:border-stone-850/40">
              <Skeleton variant="circular" width={80} height={80} />
              <div className="space-y-1.5 w-full flex flex-col items-center">
                <Skeleton variant="text" width="60%" className="h-4.5 font-semibold" />
                <Skeleton variant="text" width="40%" className="h-3" />
              </div>
            </div>

            {/* Profile Nav list Links */}
            <div className="space-y-4 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton variant="rectangular" width={20} height={20} className="rounded-md" />
                  <Skeleton variant="text" width={`${50 + (i % 3) * 10}%`} className="h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Profile Info Panel Cards */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white dark:bg-[#121212]/40 rounded-3xl p-6 md:p-8 border border-stone-200/40 dark:border-stone-850/40 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="space-y-2 pb-4 border-b border-stone-100 dark:border-stone-850/40">
              <Skeleton variant="text" width="20%" className="h-5" />
              <Skeleton variant="text" width="45%" className="h-3.5" />
            </div>

            {/* Account Details Form shimmers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <Skeleton variant="text" width="30%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-10.5 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="30%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-10.5 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="30%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-10.5 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="30%" className="h-3.5" />
                <Skeleton variant="rectangular" className="h-10.5 w-full rounded-xl" />
              </div>
            </div>

            {/* Save CTA button */}
            <div className="pt-4">
              <Skeleton variant="rectangular" width="130px" className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
