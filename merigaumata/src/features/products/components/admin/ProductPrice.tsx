import React from 'react';
import { clsx } from 'clsx';

interface ProductPriceProps {
  price: number;
  mrp?: number;
  className?: string;
  priceClassName?: string;
}

export function ProductPrice({ price, mrp, className, priceClassName }: ProductPriceProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const hasDiscount = mrp && mrp > price;
  const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className={clsx('flex flex-wrap items-baseline gap-1.5', className)}>
      <span className={clsx('text-sm font-semibold text-stone-900 dark:text-stone-100', priceClassName)}>
        {formatCurrency(price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-stone-400 line-through font-normal dark:text-stone-500">
            {formatCurrency(mrp)}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-1.5 py-0.5 rounded ml-0.5 border border-emerald-100 dark:border-emerald-900/30">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
