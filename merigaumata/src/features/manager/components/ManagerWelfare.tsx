'use client';

import { useTranslations } from 'next-intl';
import { AppIcon } from '@/shared/icons';

export function ManagerWelfare() {
  const t = useTranslations('manager');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">{t('welfare.title')}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t('welfare.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-5 rounded-xl border border-border bg-emerald-500/5 flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">{t('welfare.healthStatus')}</span>
              <AppIcon name="sparkles" className="w-4 h-4 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-foreground mt-3 font-serif">{t('welfare.healthTitle')}</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('welfare.healthDesc')}</p>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block">{t('welfare.healthFooter')}</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-amber-500/5 flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">{t('welfare.feedFodder')}</span>
              <AppIcon name="award" className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-lg font-bold text-foreground mt-3 font-serif">{t('welfare.feedTitle')}</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('welfare.feedDesc')}</p>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold block">{t('welfare.feedFooter', { days: 18 })}</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col justify-between h-44">
          <div>
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">{t('welfare.adoptionSupport')}</span>
            <h4 className="text-lg font-bold text-foreground mt-3 font-serif">{t('welfare.adoptionTitle')}</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('welfare.adoptionDesc')}</p>
          </div>
          <span className="text-[11px] text-primary-500 font-bold block cursor-pointer hover:underline">{t('welfare.viewPatrons')}</span>
        </div>
      </div>
    </div>
  );
}
