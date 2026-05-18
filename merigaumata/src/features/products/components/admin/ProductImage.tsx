import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ProductImage({ src, alt, className, containerClassName }: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset states when source url changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-stone-50 dark:bg-stone-900 select-none flex items-center justify-center border-b border-stone-100 dark:border-stone-800/80',
        containerClassName
      )}
    >
      {/* Blurred Shimmer Loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-100 dark:bg-stone-900 animate-pulse">
          <div className="h-8 w-8 text-stone-300 dark:text-stone-700 animate-bounce" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {/* Fallback Display */}
      {hasError ? (
        <div className="flex flex-col items-center justify-center text-stone-300 dark:text-stone-700 p-4 h-full w-full">
          <ImageIcon className="h-10 w-10 stroke-[1.5]" />
          <span className="text-[10px] uppercase font-semibold tracking-wider mt-2 text-stone-400 dark:text-stone-500">
            Image Offline
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={clsx(
            'object-cover transition-transform duration-700 ease-out',
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            className
          )}
        />
      )}
    </div>
  );
}
