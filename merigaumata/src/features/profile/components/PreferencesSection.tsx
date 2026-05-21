'use client';

import { useState } from 'react';
import { AppIcon } from '@/shared/icons';

const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-neutral-100 dark:border-neutral-800/60 gap-1 sm:gap-4 group last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors px-6">
    <div className="w-full sm:w-1/3 text-[14px] text-neutral-500 dark:text-neutral-400 font-medium">{label}</div>
    <div className="w-full sm:w-2/3 text-[14px] text-foreground font-medium">{value}</div>
  </div>
);

export function PreferencesSection() {
  const [preferredCurrency, setPreferredCurrency] = useState("INR");

  return (
    <div id="preferences" className="bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-max scroll-mt-24">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="font-semibold text-foreground">Preferences</h3>
      </div>
      <div className="flex flex-col py-1">
        <DetailRow label="Email Notifications:" value={
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-blue-50 text-blue-600 border border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30">
            Subscribed
          </span>
        } />
        <DetailRow label="SMS Alerts:" value={
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-green-50 text-green-600 border border-green-200/50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
            Enabled
          </span>
        } />
        <DetailRow label="Default Dashboard View:" value="Compact Mode" />
        <DetailRow label="Dark Mode:" value="Auto" />
        <DetailRow label="Preferred Currency:" value={
          <div className="relative inline-block w-full max-w-[140px]">
            <select 
              value={preferredCurrency} 
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none cursor-pointer"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
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
