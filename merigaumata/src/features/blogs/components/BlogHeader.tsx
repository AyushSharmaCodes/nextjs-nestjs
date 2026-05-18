'use client';

import { Link } from '@/i18n/navigation';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BlogHeaderProps {
  onShareClick: () => void;
}

export function BlogHeader({ onShareClick }: BlogHeaderProps) {
  const t = useTranslations('blogs');

  return (
    <div className="mb-6 flex items-center justify-between">
      <Link 
        href="/blogs" 
        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-extrabold uppercase tracking-wider text-stone-500 hover:text-[#DE7A41] dark:hover:text-[#DE7A41] transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>

      <button 
        onClick={onShareClick}
        className="inline-flex items-center gap-2 border border-[#DE7A41] text-[#DE7A41] hover:bg-[#DE7A41]/5 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>{t('share')}</span>
      </button>
    </div>
  );
}
