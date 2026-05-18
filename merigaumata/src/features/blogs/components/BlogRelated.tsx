'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { BlogPost } from '../types/blogs.types';
import { useTranslations } from 'next-intl';

interface BlogRelatedProps {
  relatedPosts: BlogPost[];
}

export function BlogRelated({ relatedPosts }: BlogRelatedProps) {
  const t = useTranslations('blogs');

  return (
    <section className="bg-stone-50/50 dark:bg-neutral-900/10 border-t border-stone-100 dark:border-neutral-800 pt-16 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section header */}
        <div className="flex items-center justify-between mb-10 max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black text-stone-900 dark:text-white tracking-tight uppercase">
            {t('related')}
          </h2>
          
          {/* View All Button matching screenshot shape */}
          <Link 
            href="/blogs" 
            className="border border-[#DE7A41] text-[#DE7A41] hover:bg-[#DE7A41]/5 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer"
          >
            <span>View All</span>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {relatedPosts.map((related) => (
            <article 
              key={related.id} 
              className="flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-stone-100 dark:border-neutral-800 transition-all duration-300 group cursor-pointer"
            >
              <Link href={`/blog/${related.id}`} className="block relative w-full aspect-[16/10] overflow-hidden bg-stone-50 dark:bg-neutral-800">
                <Image 
                  src={related.image}
                  alt={related.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </Link>
              
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">
                  {related.date}
                </span>
                <h3 className="text-base md:text-lg font-bold text-stone-900 dark:text-white mb-3 group-hover:text-[#DE7A41] dark:group-hover:text-[#DE7A41] transition-colors line-clamp-2 leading-snug">
                  <Link href={`/blog/${related.id}`}>{related.title}</Link>
                </h3>
                <p className="text-stone-500 dark:text-neutral-400 text-xs md:text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
                  {related.excerpt}
                </p>
                
                {/* Read More Trigger link */}
                <Link 
                  href={`/blog/${related.id}`} 
                  className="text-[#DE7A41] hover:text-[#c45a27] font-extrabold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 mt-2 transition-colors cursor-pointer"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
