'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function EventDetailLoading() {
  const t = useTranslations('loading');

  return (
    <div className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Event Top Banner Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left - Visual Banner */}
        <div className="lg:col-span-8 space-y-6">
          <Skeleton 
            variant="rectangular" 
            className="w-full aspect-[16/9] rounded-3xl bg-neutral-200/40 dark:bg-neutral-800/40" 
          />
          
          {/* Header titles */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={70} className="h-6 rounded-md" />
              <Skeleton variant="rectangular" width={110} className="h-6 rounded-md" />
            </div>
            <Skeleton variant="text" width="85%" className="h-9 font-serif" />
            <SkeletonTextRows count={4} />
          </div>
        </div>

        {/* Right - Event Details card */}
        <div className="lg:col-span-4">
          <div className="bg-[#FDFBF7] dark:bg-stone-900/30 rounded-3xl p-6 border border-stone-200/40 dark:border-stone-800/40 shadow-sm space-y-6">
            <Skeleton variant="text" width="60%" className="h-5" />
            
            {/* Event Specs List */}
            <div className="space-y-4 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton variant="circular" width={32} height={32} />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton variant="text" width="30%" className="h-3" />
                    <Skeleton variant="text" width="80%" className="h-4" />
                  </div>
                </div>
              ))}
            </div>

            <Skeleton variant="rectangular" className="h-[1px] w-full" />
            
            {/* Registration CTA Button */}
            <Skeleton variant="rectangular" className="h-11 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
