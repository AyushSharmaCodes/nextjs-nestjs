'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { AppIcon } from '@/shared/icons';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const progress = (currentPage / totalPages) * 100;

  const handlePrev = (e: React.MouseEvent) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(currentPage + 1);
    }
  };

  const prevClass = `w-10 h-10 rounded border flex items-center justify-center transition-colors ${
    currentPage === 1 
      ? 'border-tertiary-200 text-tertiary-400 dark:border-tertiary-800 dark:text-tertiary-600 pointer-events-none' 
      : 'border-tertiary-300 text-tertiary-900 hover:bg-tertiary-100 dark:border-tertiary-700 dark:text-tertiary-50 dark:hover:bg-tertiary-800 cursor-pointer'
  }`;

  const nextClass = `w-10 h-10 rounded text-tertiary-50 bg-tertiary-900 dark:text-tertiary-900 dark:bg-tertiary-50 flex items-center justify-center transition-colors ${
    currentPage === totalPages 
      ? 'opacity-50 pointer-events-none' 
      : 'hover:bg-tertiary-800 dark:hover:bg-tertiary-200 cursor-pointer'
  }`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-t border-tertiary-200 dark:border-tertiary-800">
      <div className="flex items-center gap-6 flex-1 max-w-sm">
        <span className="text-sm font-semibold text-tertiary-900 dark:text-tertiary-50 w-12">
          {String(currentPage).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
        </span>
        
        <div className="h-1 flex-1 bg-tertiary-200 dark:bg-tertiary-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-tertiary-900 dark:bg-tertiary-50 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onPageChange ? (
          <button onClick={handlePrev} className={prevClass} disabled={currentPage === 1}>
            <AppIcon name="arrowLeft" size="md" />
          </button>
        ) : (
          <Link href={createPageURL(currentPage - 1)} className={prevClass} aria-disabled={currentPage === 1}>
            <AppIcon name="arrowLeft" size="md" />
          </Link>
        )}
        
        {onPageChange ? (
          <button onClick={handleNext} className={nextClass} disabled={currentPage === totalPages}>
            <AppIcon name="arrowRight" size="md" />
          </button>
        ) : (
          <Link href={createPageURL(currentPage + 1)} className={nextClass} aria-disabled={currentPage === totalPages}>
            <AppIcon name="arrowRight" size="md" />
          </Link>
        )}
      </div>
    </div>
  );
}
