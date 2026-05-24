'use client';

import { AppIcon } from '@/shared/icons';
import { CountryOption } from '../types/profile.types';
import { useTranslations } from 'next-intl';

const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-neutral-100 dark:border-neutral-800/60 gap-1 sm:gap-4 group last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors px-6">
    <div className="w-full sm:w-1/3 text-[14px] text-neutral-500 dark:text-neutral-400 font-medium">{label}</div>
    <div className="w-full sm:w-2/3 text-[14px] text-foreground font-medium">{value}</div>
  </div>
);

export interface PreferencesSectionProps {
  preferredCurrency: string | null;
  onCurrencyChange: (currency: string) => void;
  countries?: CountryOption[];
  emailNotification: boolean;
  onEmailNotificationChange: (subscribed: boolean) => void;
}

export function PreferencesSection({ 
  preferredCurrency, 
  onCurrencyChange, 
  countries = [], 
  emailNotification, 
  onEmailNotificationChange 
}: PreferencesSectionProps) {
  const t = useTranslations('profile');

  // Extract distinct, non-empty currencies
  const uniqueCurrencies = Array.from(
    new Set(
      countries
        .map((c) => c.currency)
        .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    )
  ).sort();

  const currenciesToDisplay = uniqueCurrencies.length > 0 ? uniqueCurrencies : ['INR', 'USD', 'EUR', 'GBP'];

  return (
    <div id="preferences" className="bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-max scroll-mt-24">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="font-semibold text-foreground">{t('preferences.title')}</h3>
      </div>
      <div className="flex flex-col py-1">
        <DetailRow label={t('preferences.emailNotifications')} value={
          <button 
            onClick={() => onEmailNotificationChange(!emailNotification)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold border transition-all duration-200 ${
              emailNotification 
                ? 'bg-blue-50 text-blue-600 border-blue-200/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30 dark:hover:bg-blue-900/30' 
                : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900/40 dark:text-neutral-400 dark:border-neutral-800/60 dark:hover:bg-neutral-900/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emailNotification ? 'bg-blue-500' : 'bg-neutral-400'}`}></span>
            {emailNotification ? t('preferences.subscribed') : t('preferences.unsubscribed')}
          </button>
        } />
        <DetailRow label={t('preferences.preferredCurrency')} value={
          <div className="relative inline-block w-full max-w-[140px]">
            <select 
              value={preferredCurrency || "INR"} 
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none cursor-pointer"
            >
              {currenciesToDisplay.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
              <AppIcon name="chevronDown" size="sm" />
            </div>
          </div>
        } />
      </div>
    </div>
  );
}

