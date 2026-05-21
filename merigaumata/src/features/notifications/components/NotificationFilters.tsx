import React from 'react';
import { useTranslations } from 'next-intl';
import { AppIcon } from '@/shared/icons';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationStatus, NotificationType } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '../hooks/useNotifications';

export function NotificationFilters() {
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();
  const { filters, setSearch, setStatus, setType, resetFilters } = useNotificationStore();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  };

  const statusTabs: { value: NotificationStatus | 'all'; labelKey: string }[] = [
    { value: 'all', labelKey: 'all' },
    { value: 'unread', labelKey: 'unreadLabel' },
    { value: 'read', labelKey: 'readLabel' },
    { value: 'archived', labelKey: 'archivedLabel' },
  ];

  const types: { value: NotificationType | 'all'; labelKey: string }[] = [
    { value: 'all', labelKey: 'all' },
    { value: 'order', labelKey: 'typeOrder' },
    { value: 'system', labelKey: 'typeSystem' },
    { value: 'payment', labelKey: 'typePayment' },
    { value: 'delivery', labelKey: 'typeDelivery' },
  ];

  return (
    <div className="space-y-4 bg-card p-5 rounded-[20px] border border-earth-200/60 dark:border-transparent shadow-sm">
      {/* Search and Dropdowns Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <AppIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-xs font-semibold placeholder:text-foreground/45 outline-none transition-all duration-200"
          />
        </div>

        {/* Filters dropdown and actions */}
        <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end">
          <div className="flex items-center gap-2">
            <AppIcon name="filter" className="w-4 h-4 text-foreground/40" />
            <select
              value={filters.type}
              onChange={(e) => setType(e.target.value as NotificationType | 'all')}
              className="px-3.5 py-2.5 rounded-[12px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-xs font-bold outline-none cursor-pointer transition-all duration-200"
            >
              {types.map((tp) => (
                <option key={tp.value} value={tp.value}>
                  {t(tp.labelKey as any)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-[12px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent hover:bg-earth-100 dark:hover:bg-earth-900 hover:text-primary-600 dark:hover:text-primary-400 active:scale-95 transition-all outline-none flex items-center justify-center"
            title="Refresh list"
          >
            <AppIcon name="refresh" className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 rounded-[12px] text-xs font-extrabold text-foreground/60 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900/60 active:scale-95 transition-all outline-none"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Tabs list filter */}
      <div className="flex items-center gap-2.5 overflow-x-auto border-t border-earth-100 dark:border-earth-900/40 pt-4 scrollbar-none">
        {statusTabs.map((tab) => {
          const isActive = filters.status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4.5 py-2.5 rounded-[10px] text-xs font-extrabold transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                  : 'text-foreground/70 dark:text-foreground/60 bg-earth-50 dark:bg-earth-950 hover:bg-earth-100 dark:hover:bg-earth-900 border border-earth-200/30 dark:border-transparent'
              }`}
            >
              {t(tab.labelKey as any)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
