'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface BlogTitleCardProps {
  category: string;
  title: string;
  authorAvatar: string;
  author: string;
  date: string;
}

export function BlogTitleCard({ category, title, authorAvatar, author, date }: BlogTitleCardProps) {
  const t = useTranslations('blogs');

  return (
    <div className="relative -mt-28 md:-mt-36 max-w-6xl mx-auto px-6 sm:px-10 z-10">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-stone-100/80 dark:border-neutral-800 flex flex-col gap-4 transition-all">
        
        {/* Category tag */}
        <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Category <span className="text-[#DE7A41] font-black">{category}</span>
        </div>

        {/* Heading */}
        <h1 className="text-2.5xl sm:text-3.5xl md:text-4.5xl lg:text-[2.85rem] font-extrabold text-stone-900 dark:text-white leading-[1.2] tracking-tight font-sans">
          {title}
        </h1>

        {/* Author details with borderless spacing */}
        <div className="flex items-center gap-3.5 mt-3 pt-2">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-805 flex-shrink-0 relative">
            <Image 
              src={authorAvatar} 
              alt={author} 
              fill 
              className="object-cover animate-pulse"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-stone-900 dark:text-white leading-tight">
              {t('by')} {author}
            </span>
            <span className="text-xs text-stone-400 font-semibold mt-1">
              {date}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
