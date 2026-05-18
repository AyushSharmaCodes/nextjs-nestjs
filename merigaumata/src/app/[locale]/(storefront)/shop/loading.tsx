'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProductSkeleton from '@/shared/ui/loading/skeletons/product-skeleton';

export default function ShopLoading() {
  const t = useTranslations('loading');
  
  return (
    <div className="pt-28 pb-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Title indicating localized loading state */}
      <h1 className="text-xl font-serif text-tertiary-700 dark:text-tertiary-300 animate-pulse font-semibold">
        {t('shop')}
      </h1>
      
      {/* Product Skeleton Loader */}
      <ProductSkeleton />
    </div>
  );
}
