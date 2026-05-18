import React from 'react';
import { useTranslations } from 'next-intl';
import { Star, Tag, Award } from 'lucide-react';
import { Product } from '../../types/products.types';

interface ProductMetadataProps {
  product: Product;
}

export function ProductMetadata({ product }: ProductMetadataProps) {
  const t = useTranslations('products');

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-stone-500 dark:text-stone-400">
      {/* Category group */}
      <div className="flex items-center gap-1">
        <Tag className="h-3 w-3 text-stone-400" />
        <span className="capitalize">{product.category}</span>
      </div>

      {/* Ratings */}
      {typeof product.rating === 'number' && product.rating > 0 && (
        <div className="flex items-center gap-1 border-l border-stone-200 dark:border-stone-800 pl-3">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-stone-400">
            ({product.reviewsCount || 0})
          </span>
        </div>
      )}

      {/* Featured Badge */}
      {product.featured && (
        <div className="flex items-center gap-1 border-l border-stone-200 dark:border-stone-800 pl-3 text-amber-600 dark:text-amber-400 font-semibold text-[10px]">
          <Award className="h-3 w-3" />
          <span>{t('featured')}</span>
        </div>
      )}
    </div>
  );
}
