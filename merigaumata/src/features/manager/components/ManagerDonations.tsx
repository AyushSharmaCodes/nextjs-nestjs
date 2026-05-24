'use client';

import { useTranslations } from 'next-intl';
import { Donation } from '../types/manager.types';

interface ManagerDonationsProps {
  donationsList: Donation[];
  translateIfKey: (text: string) => string;
}

export function ManagerDonations({
  donationsList,
  translateIfKey
}: ManagerDonationsProps) {
  const t = useTranslations('manager');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">{t('donations.title')}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t('donations.subtitle')}</p>
      </div>

      <div className="p-6 border border-border bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase">{t('donations.sourceHeader')}</span>
          <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase">{t('donations.contributionHeader')}</span>
        </div>

        <div className="space-y-3">
          {donationsList.map(donation => (
            <div key={donation.id} className="flex justify-between items-center text-sm font-semibold">
              <span className="text-neutral-800 dark:text-neutral-200">{translateIfKey(donation.source)} ({translateIfKey(donation.purpose)})</span>
              <span className="text-emerald-600 font-bold">{donation.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
