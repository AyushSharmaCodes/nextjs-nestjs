'use client';

import { AppIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';

interface BlogShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  currentUrl: string;
  onShareClick: (platform: string) => void;
  onCopyLink: () => void;
  copied: boolean;
  shareInputRef: React.RefObject<HTMLInputElement | null>;
}

export function BlogShareModal({
  isOpen,
  onClose,
  currentUrl,
  onShareClick,
  onCopyLink,
  copied,
  shareInputRef,
}: BlogShareModalProps) {
  const t = useTranslations('blogs');
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-250"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative border border-stone-100 dark:border-neutral-800 flex flex-col gap-6 animate-in scale-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title / Close */}
        <div className="flex items-center justify-between pb-1">
          <h4 className="text-xl font-bold text-stone-900 dark:text-white">Share this page</h4>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 bg-stone-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center"
            aria-label="Close modal"
          >
            <AppIcon name="close" size="xs" />
          </button>
        </div>

        {/* Social Icons row with light outline circles */}
        <div className="flex items-center justify-between py-2 px-1">
          <button 
            onClick={() => onShareClick('facebook')}
            className="group flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-12 h-12 border border-stone-200 dark:border-neutral-700 group-hover:border-[#1877F2] text-stone-400 group-hover:text-[#1877F2] rounded-full flex items-center justify-center transition-all duration-300">
              <AppIcon name="facebook" size="sm" />
            </div>
            <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-700 dark:group-hover:text-neutral-200 transition-colors">Facebook</span>
          </button>

          <button 
            onClick={() => onShareClick('twitter')}
            className="group flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-12 h-12 border border-stone-200 dark:border-neutral-700 group-hover:border-[#1DA1F2] text-stone-400 group-hover:text-[#1DA1F2] rounded-full flex items-center justify-center transition-all duration-300">
              <AppIcon name="twitter" size="sm" />
            </div>
            <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-700 dark:group-hover:text-neutral-200 transition-colors">Twitter</span>
          </button>

          <button 
            onClick={onCopyLink}
            className="group flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-12 h-12 border border-stone-200 dark:border-neutral-700 group-hover:border-[#DE7A41] text-stone-400 group-hover:text-[#DE7A41] rounded-full flex items-center justify-center transition-all duration-300">
              <AppIcon name="instagram" size="sm" />
            </div>
            <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-700 dark:group-hover:text-neutral-200 transition-colors">Copy Link</span>
          </button>

          <button 
            onClick={() => onShareClick('linkedin')}
            className="group flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-12 h-12 border border-stone-200 dark:border-neutral-700 group-hover:border-[#0A66C2] text-stone-400 group-hover:text-[#0A66C2] rounded-full flex items-center justify-center transition-all duration-300">
              <AppIcon name="linkedin" size="sm" />
            </div>
            <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-700 dark:group-hover:text-neutral-200 transition-colors">LinkedIn</span>
          </button>
        </div>

        {/* Input Link section */}
        <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 dark:border-neutral-800">
          <label className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">
            Share this link
          </label>
          <div className="flex gap-2 bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-1.5">
            <input 
              type="text" 
              ref={shareInputRef}
              value={currentUrl}
              readOnly
              className="flex-grow bg-transparent text-stone-700 dark:text-neutral-300 text-xs outline-none px-3 font-medium select-all"
            />
            
            {/* Redfilled Copy Button */}
            <button 
              onClick={onCopyLink}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${copied ? 'bg-emerald-600 text-white shadow-sm' : 'bg-[#DE7A41] hover:bg-[#c45a27] text-white shadow-sm'}`}
            >
              <AppIcon name="copy" size="xs" className="w-3 h-3" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
