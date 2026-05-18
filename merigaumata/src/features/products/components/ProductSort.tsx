'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ProductSort() {
  const t = useTranslations('products');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sortBy') || 'featured';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <select 
        value={currentSort}
        onChange={handleSortChange}
        className="w-full sm:w-auto appearance-none bg-transparent border border-tertiary-300 dark:border-tertiary-700 rounded-full py-2.5 pl-5 pr-12 text-sm font-semibold text-tertiary-900 dark:text-tertiary-100 focus:outline-none focus:ring-2 focus:ring-[#1B8057] cursor-pointer"
      >
        <option value="featured" className="text-black">{t('sortFeatured')}</option>
        <option value="price-low-high" className="text-black">{t('sortPriceLowHigh')}</option>
        <option value="price-high-low" className="text-black">{t('sortPriceHighLow')}</option>
        <option value="newest" className="text-black">{t('sortNewest')}</option>
      </select>
      <ChevronRight className="w-4 h-4 text-tertiary-600 dark:text-tertiary-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
    </div>
  );
}
