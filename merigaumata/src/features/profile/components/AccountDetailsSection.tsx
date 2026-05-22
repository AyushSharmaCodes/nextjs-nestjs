'use client';

import { AppIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';
import { AccountDetails } from '../types/profile.types';

interface AccountDetailsSectionProps {
  accountDetails: AccountDetails;
  tempAccountDetails: AccountDetails;
  setTempAccountDetails: (details: AccountDetails) => void;
  isEditingAccount: boolean;
  setIsEditingAccount: (val: boolean) => void;
  saveAccountDetails: () => void;
  hasAccountChanges: boolean;
  userRole: string;
  emailVerified: boolean;
  translateIfKey: (text: string) => string;
}

const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-neutral-100 dark:border-neutral-800/60 gap-1 sm:gap-4 group last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors px-6">
    <div className="w-full sm:w-1/3 text-[14px] text-neutral-500 dark:text-neutral-400 font-medium">{label}</div>
    <div className="w-full sm:w-2/3 text-[14px] text-foreground font-medium">{value}</div>
  </div>
);

export function AccountDetailsSection({
  accountDetails,
  tempAccountDetails,
  setTempAccountDetails,
  isEditingAccount,
  setIsEditingAccount,
  saveAccountDetails,
  hasAccountChanges,
  userRole,
  emailVerified,
  translateIfKey,
}: AccountDetailsSectionProps) {
  const t = useTranslations('profile');

  return (
    <div className="bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col relative h-max">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-card">
        <h3 className="font-semibold text-foreground">{t('accountDetails.title')}</h3>
        {!isEditingAccount && (
          <button 
            onClick={() => { setIsEditingAccount(true); setTempAccountDetails(accountDetails); }} 
            className="text-neutral-500 hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium focus:outline-none"
          >
            <AppIcon name="edit2" size="xs" /> Edit
          </button>
        )}
      </div>
      <div className="flex flex-col py-1 flex-1">
        {isEditingAccount ? (
          <div className="p-6 grid grid-cols-1 gap-4">
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => setIsEditingAccount(false)} 
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={saveAccountDetails} 
                disabled={!hasAccountChanges}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${hasAccountChanges ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'}`}
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <DetailRow label="Account Created:" value={accountDetails.createdAt ? new Date(accountDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : '—'} />
            <DetailRow label="Last Login:" value={accountDetails.lastLogin ? new Date(accountDetails.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '—'} />
            <DetailRow label="Account Verification:" value={
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium border ${
                  emailVerified
                    ? 'bg-green-50 text-green-600 border-green-200/50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30'
                    : 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/30'
                }`}
              >
                {emailVerified ? 'Verified' : 'Not verified'}
              </span>
            } />
            <DetailRow label="Time Zone:" value={accountDetails.timeZone} />
          </>
        )}
      </div>
    </div>
  );
}
