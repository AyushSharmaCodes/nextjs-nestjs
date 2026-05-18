'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FAQ } from '../types/products.types';

interface FaqSectionProps {
  initialFaqs: FAQ[];
}

export function FaqSection({ initialFaqs }: FaqSectionProps) {
  const t = useTranslations('products');
  const [faqStates, setFaqStates] = useState<FAQ[]>(initialFaqs);

  const toggleFaq = (faqId: number) => {
    setFaqStates(prev => prev.map(faq => {
      if (faq.id === faqId) {
        return { ...faq, open: !faq.open };
      }
      return faq;
    }));
  };

  return (
    <div className="border-t border-stone-200 dark:border-stone-800 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      
      <div className="lg:col-span-4">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E1F30] dark:text-stone-100 leading-tight mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed">
          Find instant answers to questions regarding Vedic authenticity, organic safety, eco-responsibility, and global delivery estimates.
        </p>
      </div>

      <div className="lg:col-span-8 divide-y divide-stone-200/50 dark:divide-stone-800/50">
        {faqStates.map((faq) => (
          <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
            <button
              onClick={() => toggleFaq(faq.id)}
              className="w-full flex items-center justify-between text-[#2E1F30] dark:text-stone-200 font-extrabold text-xs sm:text-sm tracking-wider uppercase text-left py-2 cursor-pointer"
            >
              <span>{faq.question}</span>
              {faq.open ? <Minus className="w-4 h-4 text-stone-400 shrink-0 ml-4" /> : <Plus className="w-4 h-4 text-[#2E1F30] shrink-0 ml-4" />}
            </button>
            {faq.open && (
              <div className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light leading-relaxed pr-8">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
