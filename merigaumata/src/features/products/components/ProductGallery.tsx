'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProductGalleryProps {
  galleryImages: string[];
  productName: string;
}

export function ProductGallery({ galleryImages, productName }: ProductGalleryProps) {
  const t = useTranslations('products');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [galleryStartIndex, setGalleryStartIndex] = useState<number>(0);

  return (
    <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start w-full">
      
      {/* Gallery Thumbnail Stack */}
      <div className="flex md:flex-col gap-3 justify-center md:justify-start items-center md:w-20 lg:w-24 w-full flex-shrink-0">
        <button 
          onClick={() => setGalleryStartIndex(prev => Math.max(0, prev - 1))}
          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hidden md:block cursor-pointer disabled:opacity-30"
          disabled={galleryStartIndex === 0}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-w-full no-scrollbar">
          {galleryImages.slice(galleryStartIndex, galleryStartIndex + 5).map((img, idx) => {
            const actualIdx = galleryStartIndex + idx;
            return (
              <button
                key={actualIdx}
                onClick={() => setActiveImageIndex(actualIdx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-none p-0 bg-[#F6F3E6]/60 border-2 transition-all flex-shrink-0 flex items-center justify-center cursor-pointer ${
                  activeImageIndex === actualIdx 
                    ? 'border-[#2E1F30] bg-[#F6F3E6]' 
                    : 'border-stone-200/20 hover:border-stone-300 bg-white/40'
                }`}
              >
                <Image 
                  src={img} 
                  alt={`Angle ${actualIdx + 1}`} 
                  fill 
                  sizes="80px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => setGalleryStartIndex(prev => Math.min(galleryImages.length - 5, prev + 1))}
          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hidden md:block cursor-pointer disabled:opacity-30"
          disabled={galleryStartIndex >= galleryImages.length - 5}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Main Featured Highlighted Card */}
      <div className="flex-1 w-full relative aspect-square rounded-none bg-[#F6F3E6]/60 dark:bg-stone-900/30 p-0 flex items-center justify-center border border-stone-200/20 dark:border-stone-800/10 overflow-hidden">
        
        {/* Main Badge */}
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-white/95 dark:bg-stone-900/95 text-stone-800 dark:text-stone-200 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-stone-200 shadow-sm tracking-widest uppercase">
            {t('bestSeller')}
          </span>
        </div>

        <div className="relative w-full h-full">
          <Image 
            src={galleryImages[activeImageIndex]} 
            alt={productName} 
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-all duration-500"
            priority
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}
