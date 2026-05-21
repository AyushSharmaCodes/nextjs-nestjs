'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AppIcon } from '@/shared/icons';

interface MediaLightboxProps {
  activeMediaUrl: string;
  activeGalleryTitle?: string;
  activeMediaIndex: number;
  totalImages: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  isVideo: boolean;
  itemCounterText: string;
}

export default function MediaLightbox({
  activeMediaUrl,
  activeGalleryTitle,
  activeMediaIndex,
  totalImages,
  onClose,
  onPrev,
  onNext,
  isVideo,
  itemCounterText
}: MediaLightboxProps) {
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Lock background scroll when lightbox viewport is active to optimize UX/a11y
  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Close Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200 z-50 shadow-md cursor-pointer hover:scale-105 flex items-center justify-center"
        aria-label="Close viewport"
      >
        <AppIcon name="close" className="w-6 h-6" />
      </button>

      {/* Navigation Left */}
      {totalImages > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 p-3 sm:p-4 rounded-full transition-all duration-200 z-50 shadow-md cursor-pointer hover:scale-105 flex items-center justify-center"
          aria-label="Previous media"
        >
          <AppIcon name="chevronLeft" className="w-6 h-6 sm:w-8 h-8" />
        </button>
      )}

      {/* Main Viewport Media */}
      <div 
        className="relative w-full max-w-5xl max-h-[75vh] flex items-center justify-center select-none animate-in scale-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 relative">
            <iframe 
              className="w-full h-full object-cover"
              src={`${activeMediaUrl}${activeMediaUrl.includes('?') ? '&' : '?'}autoplay=1&controls=1&modestbranding=1`} 
              title={activeGalleryTitle || "Video player"} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="relative w-full h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <Image 
              src={activeMediaUrl} 
              alt={activeGalleryTitle || "Gallery preview"} 
              fill
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* Navigation Right */}
      {totalImages > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 p-3 sm:p-4 rounded-full transition-all duration-200 z-50 shadow-md cursor-pointer hover:scale-105 flex items-center justify-center"
          aria-label="Next media"
        >
          <AppIcon name="chevronRight" className="w-6 h-6 sm:w-8 h-8" />
        </button>
      )}

      {/* Footer / Caption details */}
      <div 
        className="mt-6 text-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-white text-lg font-semibold tracking-wide leading-snug">
          {activeGalleryTitle}
        </h4>
        <p className="text-white/60 text-xs mt-1.5 font-medium tracking-wider uppercase">
          {itemCounterText}
        </p>
      </div>
    </div>
  );
}
