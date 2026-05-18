import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductBadge } from './ProductBadge';

interface ProductInventoryProps {
  stock: number;
  soldCount?: number;
}

export function ProductInventory({ stock, soldCount = 0 }: ProductInventoryProps) {
  const t = useTranslations('products');

  // Determine stock tier
  let variant: 'inStock' | 'low-stock' | 'out-of-stock' = 'inStock';
  let label = t('inStock');

  if (stock === 0) {
    variant = 'out-of-stock';
    label = t('outOfStock');
  } else if (stock <= 10) {
    variant = 'low-stock';
    label = `${t('lowStock')} (${stock})`;
  }

  // Calculate sell-through ratio for progress indicator
  const totalItems = stock + soldCount;
  const sellThroughPercent = totalItems > 0 ? Math.round((soldCount / totalItems) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-stone-500 font-medium dark:text-stone-400">
          {stock} {t('stock')}
        </span>
        <ProductBadge variant={variant === 'inStock' ? 'active' : variant}>
          {label}
        </ProductBadge>
      </div>

      {/* Progress sell-through bar */}
      <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden relative">
        <div
          style={{ width: `${sellThroughPercent}%` }}
          className="h-full bg-stone-900 dark:bg-stone-100 rounded-full transition-all duration-500 ease-out"
        />
      </div>

      <div className="flex justify-between text-[9px] text-stone-400 font-medium dark:text-stone-500">
        <span>{soldCount} {t('sold')}</span>
        <span>{sellThroughPercent}% velocity</span>
      </div>
    </div>
  );
}
