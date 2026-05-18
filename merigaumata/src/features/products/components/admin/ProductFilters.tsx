import React from 'react';
import { useTranslations } from 'next-intl';
import { X, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onReset: () => void;
}

export function ProductFilters({
  isOpen,
  onClose,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  onReset,
}: ProductFiltersProps) {
  const t = useTranslations('products');

  if (!isOpen) return null;

  const stockStatuses = [
    { value: 'all', label: t('allProducts') },
    { value: 'active', label: t('active') },
    { value: 'draft', label: t('draft') },
    { value: 'low-stock', label: t('lowStock') },
    { value: 'out-of-stock', label: t('outOfStock') },
    { value: 'archived', label: t('archived') },
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
  ];

  return (
    <div className="w-full bg-stone-50 dark:bg-stone-900/40 border border-stone-250 dark:border-stone-850 rounded-2xl p-4 flex flex-col gap-4 animate-slide-down relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        aria-label="Close filters shelf"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-850 pb-2">
        <Filter className="h-4 w-4 text-stone-500" />
        <h4 className="font-serif font-bold text-sm">Advanced Catalog Filters</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Status filter group */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Stock Status & State
          </label>
          <div className="flex flex-wrap gap-1.5">
            {stockStatuses.map((opt) => {
              const isActive = status === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onStatusChange(opt.value)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer select-none',
                    isActive
                      ? 'bg-stone-900 border-stone-900 text-white dark:bg-stone-100 dark:border-stone-100 dark:text-stone-950 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-stone-900/50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort options */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Sort Order Sequence
          </label>
          <div className="flex flex-wrap gap-1.5">
            {sortOptions.map((opt) => {
              const isActive = sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSortByChange(opt.value)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer select-none',
                    isActive
                      ? 'bg-stone-900 border-stone-900 text-white dark:bg-stone-100 dark:border-stone-100 dark:text-stone-950 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-stone-900/50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Controls */}
      <div className="flex justify-end gap-2 border-t border-stone-200 dark:border-stone-850 pt-3 mt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 text-xs flex items-center gap-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 border-stone-200 dark:border-stone-850"
        >
          <RefreshCw className="h-3 w-3" />
          <span>{t('clearFilters')}</span>
        </Button>
      </div>

    </div>
  );
}
