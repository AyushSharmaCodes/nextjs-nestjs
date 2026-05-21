'use client';

import { useState } from 'react';
import { AppIcon } from '@/shared/icons';
import { Link } from '@/i18n/navigation';
import { FAQ } from '../types/contact.types';

interface FAQSectionProps {
  faqs: FAQ[];
  title: string;
  description: string;
  buttonText: string;
}

export function FAQSection({ faqs, title, description, buttonText }: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 md:p-12 lg:p-16 border shadow-sm border-neutral-200 dark:border-neutral-800">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-tertiary-900 dark:text-white mb-4">{title}</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
          {description}
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-4 mb-10">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`border ${openFaq === index ? 'border-primary-300 dark:border-primary-800' : 'border-neutral-200 dark:border-neutral-800'} rounded-2xl overflow-hidden transition-colors duration-300`}
          >
            <button 
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <span className={`font-semibold text-lg ${openFaq === index ? 'text-primary-600 dark:text-primary-400' : 'text-tertiary-900 dark:text-white'}`}>
                {faq.question}
              </span>
              <div className={`shrink-0 ml-4 flex items-center justify-center w-8 h-8 rounded-full ${openFaq === index ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-neutral-100 dark:bg-tertiary-800 text-neutral-500'}`}>
                <AppIcon name="chevronDown" className={`w-5 h-5 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-6 pt-0 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/faq" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-tertiary-900 dark:border-white text-tertiary-900 dark:text-white rounded-full font-bold hover:bg-tertiary-900 hover:text-white dark:hover:bg-white dark:hover:text-tertiary-900 transition-all hover:scale-105 group">
          {buttonText}
          <AppIcon name="arrowUpRight" className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
