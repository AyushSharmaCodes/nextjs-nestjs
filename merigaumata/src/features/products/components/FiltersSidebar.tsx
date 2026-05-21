'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { AppIcon } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';

interface FiltersSidebarProps {
  categories: string[];
  categoryCounts: Record<string, number>;
}

export function FiltersSidebar({ categories, categoryCounts }: FiltersSidebarProps) {
  const t = useTranslations('products');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Collapsible sections state
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  // Selected state from URL
  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const minPriceVal = searchParams.get('minPrice') || '';
  const maxPriceVal = searchParams.get('maxPrice') || '';

  // Local state for custom price inputs to prevent layout thrashing on every keystroke
  const [minInput, setMinInput] = useState(minPriceVal);
  const [maxInput, setMaxInput] = useState(maxPriceVal);

  const toggleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let current = params.get('category')?.split(',').filter(Boolean) || [];
    
    if (current.includes(category)) {
      current = current.filter(c => c !== category);
    } else {
      current.push(category);
    }

    if (current.length > 0) {
      params.set('category', current.join(','));
    } else {
      params.delete('category');
    }
    
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyPriceRange = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (min) {
      params.set('minPrice', min);
    } else {
      params.delete('minPrice');
    }
    
    if (max) {
      params.set('maxPrice', max);
    } else {
      params.delete('maxPrice');
    }
    
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`${pathname}`);
  };

  // Localize preset titles or format cleanly
  const presetPrices = [
    { label: 'All Prices', min: '', max: '' },
    { label: 'Under ₹30', min: '', max: '30' },
    { label: '₹30 to ₹60', min: '30', max: '60' },
    { label: '₹60 to ₹90', min: '60', max: '90' },
    { label: 'Over ₹90', min: '90', max: '' },
  ];

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyPriceRange(minInput, maxInput);
  };

  const hasActiveFilters = selectedCategories.length > 0 || minPriceVal !== '' || maxPriceVal !== '';

  const renderContent = () => (
    <div className="space-y-8 select-none">
      {/* Category Section */}
      <div>
        <button 
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center justify-between w-full mb-4 text-left group"
        >
          <h3 className="font-bold text-[15px] text-tertiary-800 dark:text-tertiary-100 group-hover:text-[#1B8057] transition-colors">
            {t('categories')}
          </h3>
          <AppIcon name="chevronDown" className={`w-4 h-4 text-tertiary-500 dark:text-tertiary-400 transition-transform duration-300 ${isCategoryOpen ? '' : '-rotate-90'}`} />
        </button>
        
        <AnimatePresence initial={false}>
          {isCategoryOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 overflow-hidden"
            >
              {categories.map((item) => {
                const isChecked = selectedCategories.includes(item);
                return (
                  <div 
                    key={item} 
                    onClick={() => toggleCategory(item)}
                    className="flex items-center justify-between cursor-pointer group py-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4.5 h-4.5 rounded-[4px] border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-[#1B8057] border-[#1B8057] shadow-sm shadow-emerald-500/20' 
                          : 'border-stone-300 dark:border-stone-700 group-hover:border-[#1B8057] dark:group-hover:border-[#1B8057]'
                      }`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm transition-colors ${
                        isChecked 
                          ? 'font-semibold text-tertiary-950 dark:text-white' 
                          : 'text-tertiary-700 dark:text-tertiary-200 group-hover:text-tertiary-950 dark:group-hover:text-white'
                      }`}>
                        {item}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 font-medium">({categoryCounts[item] || 0})</span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Section */}
      <div className="border-t border-stone-200/50 dark:border-stone-800/50 pt-6">
        <button 
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center justify-between w-full mb-4 text-left group"
        >
          <h3 className="font-bold text-[15px] text-tertiary-800 dark:text-tertiary-100 group-hover:text-[#1B8057] transition-colors">
            {t('priceRange')}
          </h3>
          <AppIcon name="chevronDown" className={`w-4 h-4 text-tertiary-500 dark:text-tertiary-400 transition-transform duration-300 ${isPriceOpen ? '' : '-rotate-90'}`} />
        </button>

        <AnimatePresence initial={false}>
          {isPriceOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Presets */}
              <div className="space-y-2">
                {presetPrices.map((preset) => {
                  const isActive = minPriceVal === preset.min && maxPriceVal === preset.max;
                  return (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => applyPriceRange(preset.min, preset.max)}
                      className={`block w-full text-left text-xs py-1 transition-all ${
                        isActive 
                          ? 'text-[#1B8057] font-semibold translate-x-1' 
                          : 'text-tertiary-600 dark:text-tertiary-300 hover:text-tertiary-950 dark:hover:text-white hover:translate-x-1'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Inputs */}
              <form key={`${minPriceVal}-${maxPriceVal}`} onSubmit={handlePriceApply} className="flex items-center gap-2 pt-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    className="w-full pl-5 pr-1 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 text-stone-900 dark:text-white text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-[#1B8057] placeholder:text-stone-400/80"
                  />
                </div>
                <span className="text-stone-400 text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    className="w-full pl-5 pr-1 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 text-stone-900 dark:text-white text-xs rounded-full focus:outline-none focus:ring-1 focus:ring-[#1B8057] placeholder:text-stone-400/80"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#1B8057] hover:bg-[#156343] text-white text-[10.5px] font-black uppercase tracking-wider rounded-full active:scale-95 transition-all shadow-sm"
                >
                  Go
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Filters CTA */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-rose-500/20 dark:border-rose-500/10 hover:border-rose-500/30 text-rose-500 dark:text-rose-450 text-[11.5px] font-bold uppercase tracking-wider rounded-full hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-all select-none"
        >
          <AppIcon name="close" className="w-3.5 h-3.5" />
          {t('clearFilters')}
        </button>
      )}
    </div>
  );

  const isMobileDrawerOpen = searchParams.get('showFilters') === 'true';

  const closeMobileDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('showFilters');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Desktop Sidebar (Render Content Directly) */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
        <h1 className="text-2xl font-bold mb-8 font-serif text-tertiary-900 dark:text-tertiary-50">{t('filters')}</h1>
        {renderContent()}
      </div>

      {/* Mobile Drawer (Portal/Overlay) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-[99] lg:hidden flex justify-end">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileDrawer}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[320px] h-full bg-[#FAF9F6] dark:bg-[#0c0c0a] shadow-2xl p-6 flex flex-col z-10 border-l border-stone-200/50 dark:border-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200/50 dark:border-stone-850/50">
                <div className="flex items-center gap-2">
                  <AppIcon name="filter" className="w-4 h-4 text-[#1B8057]" />
                  <h2 className="text-xl font-bold font-serif text-tertiary-900 dark:text-tertiary-50">{t('filters')}</h2>
                </div>
                <button 
                  onClick={closeMobileDrawer}
                  className="p-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  <AppIcon name="close" className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="flex-1 overflow-y-auto pr-1">
                {renderContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileFilterButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('products');

  const handleOpen = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('showFilters', 'true');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <button 
      onClick={handleOpen}
      className="lg:hidden flex items-center gap-2 px-4 py-2 border border-tertiary-200 dark:border-tertiary-750 rounded-full text-xs font-bold uppercase tracking-wider text-tertiary-900 dark:text-tertiary-50 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors active:scale-95 animate-fade-in"
    >
      <AppIcon name="filter" className="w-3.5 h-3.5" />
      {t('filters')}
    </button>
  );
}
