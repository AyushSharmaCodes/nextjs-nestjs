import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

interface ProductCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onChange: (category: string) => void;
}

export function ProductCategoryTabs({
  categories,
  selectedCategory,
  onChange,
}: ProductCategoryTabsProps) {
  const t = useTranslations('products');

  // Prefix "all" category
  const allCategories = ['all', ...categories];

  return (
    <div className="w-full overflow-x-auto scrollbar-none border-b border-stone-200 dark:border-stone-800/80 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex items-center gap-1.5 pb-2 min-w-max">
        {allCategories.map((category) => {
          const isActive = selectedCategory === category;
          const label = category === 'all' ? t('allProducts') : category;

          return (
            <button
              key={category}
              onClick={() => onChange(category)}
              className={clsx(
                'relative px-4 py-2 text-xs font-semibold rounded-full select-none outline-none transition-colors duration-300 capitalize cursor-pointer',
                isActive
                  ? 'text-white dark:text-stone-950 font-bold z-10'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50 dark:hover:text-stone-200'
              )}
            >
              <span className="relative z-10">{label}</span>
              {isActive && (
                <motion.span
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-stone-900 dark:bg-stone-100 rounded-full z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
