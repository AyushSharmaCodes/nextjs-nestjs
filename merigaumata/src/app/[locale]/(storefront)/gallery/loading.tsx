'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/shared/components/Skeleton';

export default function GalleryLoading() {
  const t = useTranslations('loading');

  // Vary aspect ratios and heights for staggered premium visual appeal
  const galleryItems = [
    { aspect: 'aspect-[4/3]' },
    { aspect: 'aspect-[3/4]' },
    { aspect: 'aspect-square' },
    { aspect: 'aspect-[4/5]' },
    { aspect: 'aspect-[16/10]' },
    { aspect: 'aspect-square' },
    { aspect: 'aspect-[3/4]' },
    { aspect: 'aspect-[4/3]' },
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header Info */}
      <div className="text-center max-w-lg mx-auto space-y-3">
        <Skeleton variant="text" width="25%" className="h-4.5 mx-auto" />
        <Skeleton variant="text" width="60%" className="h-8 font-serif mx-auto" />
        <Skeleton variant="text" width="90%" className="h-4.5 mx-auto" />
      </div>

      {/* Grid Filter Bar Placeholder */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-stone-200/20 dark:border-stone-850/20 pb-6 max-w-xl mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            width={i === 0 ? 80 : i === 2 ? 110 : 90} 
            className="h-9.5 rounded-full" 
          />
        ))}
      </div>

      {/* Staggered Masonry Image Cards Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {galleryItems.map((item, i) => (
          <div 
            key={i} 
            className="break-inside-avoid bg-white dark:bg-[#121212]/30 rounded-3xl p-3 border border-stone-200/40 dark:border-stone-800/40 shadow-sm flex flex-col space-y-3 mb-6"
          >
            {/* Image Placeholder */}
            <Skeleton 
              variant="rectangular" 
              className={`w-full ${item.aspect} rounded-2xl bg-neutral-200/40 dark:bg-neutral-800/40`} 
            />
            
            {/* Short Caption bar */}
            <div className="px-1 space-y-1.5 pb-1">
              <Skeleton variant="text" width="60%" className="h-4.5" />
              <Skeleton variant="text" width="40%" className="h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
