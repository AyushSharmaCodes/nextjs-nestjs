'use client';

import { Edit2 } from 'lucide-react';
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
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>
      <div className="flex flex-col py-1 flex-1">
        {isEditingAccount ? (
          <div className="p-6 grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Display Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                value={translateIfKey(tempAccountDetails.displayName)} 
                onChange={e => setTempAccountDetails({...tempAccountDetails, displayName: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Time Zone</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                value={translateIfKey(tempAccountDetails.timeZone)} 
                onChange={e => setTempAccountDetails({...tempAccountDetails, timeZone: e.target.value})} 
              />
            </div>
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
            <DetailRow label="Display Name:" value={translateIfKey(accountDetails.displayName)} />
            <DetailRow label="Account Created:" value="March 20, 2020" />
            <DetailRow label="Last Login:" value="August 22, 2024" />
            <DetailRow label="Membership Status:" value="Premium Member" />
            <DetailRow label="User Role:" value={
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 border border-primary-200/20 uppercase tracking-wider">
                {translateIfKey(`MockData.roles.${userRole.toLowerCase()}`)}
              </span>
            } />
            <DetailRow label="Account Verification:" value={
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-green-50 text-green-600 border border-green-200/50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                Verified
              </span>
            } />
            <DetailRow label="Time Zone:" value={translateIfKey(accountDetails.timeZone)} />
          </>
        )}
      </div>
    </div>
  );
}
