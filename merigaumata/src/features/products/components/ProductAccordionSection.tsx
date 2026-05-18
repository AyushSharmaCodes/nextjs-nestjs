'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface ProductAccordionSectionProps {
  activeCopy: {
    detail: string;
    benefits: string;
    delivery: string;
  };
}

export function ProductAccordionSection({ activeCopy }: ProductAccordionSectionProps) {
  const [accordions, setAccordions] = useState({
    detail: true,
    benefits: false,
    delivery: false,
  });

  const toggleAccordion = (tab: keyof typeof accordions) => {
    setAccordions(prev => ({
      ...prev,
      [tab]: !prev[tab]
    }));
  };

  return (
    <div className="border-t border-stone-200/60 dark:border-stone-800/60 mt-4">
      
      {/* Detail Tabs */}
      <div className="border-b border-stone-200/40 dark:border-stone-800/40 py-3.5">
        <button 
          onClick={() => toggleAccordion('detail')}
          className="w-full flex items-center justify-between text-[#2E1F30] dark:text-stone-200 font-extrabold text-xs tracking-wider uppercase cursor-pointer"
        >
          <span>Detail</span>
          {accordions.detail ? <Minus className="w-3.5 h-3.5 text-stone-400" /> : <Plus className="w-3.5 h-3.5 text-[#2E1F30]" />}
        </button>
        {accordions.detail && (
          <div className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light leading-relaxed transition-all duration-300">
            {activeCopy.detail}
          </div>
        )}
      </div>

      {/* Benefits Tabs */}
      <div className="border-b border-stone-200/40 dark:border-stone-800/40 py-3.5">
        <button 
          onClick={() => toggleAccordion('benefits')}
          className="w-full flex items-center justify-between text-[#2E1F30] dark:text-stone-200 font-extrabold text-xs tracking-wider uppercase cursor-pointer"
        >
          <span>Benefits</span>
          {accordions.benefits ? <Minus className="w-3.5 h-3.5 text-stone-400" /> : <Plus className="w-3.5 h-3.5 text-[#2E1F30]" />}
        </button>
        {accordions.benefits && (
          <div className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light leading-relaxed transition-all duration-300">
            {activeCopy.benefits}
          </div>
        )}
      </div>

      {/* Delivery & Returns Tabs */}
      <div className="border-b border-stone-200/40 dark:border-stone-800/40 py-3.5">
        <button 
          onClick={() => toggleAccordion('delivery')}
          className="w-full flex items-center justify-between text-[#2E1F30] dark:text-stone-200 font-extrabold text-xs tracking-wider uppercase cursor-pointer"
        >
          <span>Delivery & Returns</span>
          {accordions.delivery ? <Minus className="w-3.5 h-3.5 text-stone-400" /> : <Plus className="w-3.5 h-3.5 text-[#2E1F30]" />}
        </button>
        {accordions.delivery && (
          <div className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light leading-relaxed transition-all duration-300">
            {activeCopy.delivery}
          </div>
        )}
      </div>

    </div>
  );
}
