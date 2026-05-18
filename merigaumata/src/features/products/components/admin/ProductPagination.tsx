import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface ProductPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  page,
  limit,
  total,
  onPageChange,
}: ProductPaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const startRange = (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, total);

  // Generate numbered sequence
  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    range.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900/40 p-4 border border-stone-200/80 dark:border-stone-850 rounded-2xl shadow-sm w-full select-none">
      {/* Range text */}
      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
        Showing <span className="font-semibold text-stone-900 dark:text-stone-100">{startRange}</span> to{' '}
        <span className="font-semibold text-stone-900 dark:text-stone-100">{endRange}</span> of{' '}
        <span className="font-semibold text-stone-900 dark:text-stone-100">{total}</span> products
      </span>

      {/* Button controls */}
      <div className="flex items-center gap-1">
        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 rounded-lg border-stone-200 dark:border-stone-800 disabled:opacity-40"
          aria-label="Previous Page"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page numbers */}
        {range.map((num) => {
          const isActive = num === page;
          return (
            <Button
              key={num}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => onPageChange(num)}
              className={clsx(
                'h-8 w-8 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
                isActive
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800'
              )}
            >
              {num}
            </Button>
          );
        })}

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 rounded-lg border-stone-200 dark:border-stone-800 disabled:opacity-40"
          aria-label="Next Page"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
