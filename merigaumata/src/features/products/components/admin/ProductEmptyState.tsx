import React from 'react';
import { useTranslations } from 'next-intl';
import { PackageOpen, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductEmptyStateProps {
  onClearFilters?: () => void;
}

export function ProductEmptyState({ onClearFilters }: ProductEmptyStateProps) {
  const t = useTranslations('products');

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-850 rounded-2xl shadow-sm min-h-[350px] w-full">
      <div className="p-4 rounded-full bg-stone-50 dark:bg-stone-850 text-stone-400 mb-4 shrink-0">
        <PackageOpen className="h-10 w-10 stroke-[1.25]" />
      </div>
      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mb-1.5">
        {t('emptyTitle')}
      </h3>
      <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm font-medium mb-5 leading-relaxed">
        {t('emptyDesc')}
      </p>
      {onClearFilters && (
        <Button
          onClick={onClearFilters}
          size="sm"
          className="h-9 px-4 text-xs bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 flex items-center gap-1.5 rounded-full select-none cursor-pointer font-bold shadow-sm"
        >
          <XCircle className="h-4 w-4" />
          <span>{t('clearFilters')}</span>
        </Button>
      )}
    </div>
  );
}
