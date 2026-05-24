'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useNotificationStore } from '../store/useNotificationStore';
import { useNotificationsQuery, useNotificationSSE } from '../hooks/useNotifications';
import { NotificationFilters } from './NotificationFilters';
import { NotificationTable } from './NotificationTable';
import { NotificationSkeleton } from './NotificationSkeleton';
import { NotificationEmptyState } from './NotificationPrimitives';

export function NotificationConsole() {
  const t = useTranslations('notifications');
  const { filters } = useNotificationStore();

  // Register live simulated SSE stream notification subscriber automatically
  useNotificationSSE();

  // Query mock service / back-end API using dynamic Zustand filters
  const { data, isLoading, isError, refetch } = useNotificationsQuery(filters);

  const notifications = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, totalPages: 1, totalCount: 0 };
  const stats = data?.stats || { total: 0, unread: 0, read: 0, archived: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xs text-foreground/60 font-semibold mt-1">
            {stats ? t('unreadCount', { count: stats.unread }) : 'All notifications in one place.'}
          </p>
        </div>
      </div>

      {/* Filter and sorting widgets */}
      <NotificationFilters />

      {/* Paginated list table or alternative views */}
      {isLoading ? (
        <NotificationSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-earth-200/60 dark:border-earth-800/60 rounded-[20px] shadow-sm">
          <p className="text-sm font-bold text-red-500 mb-4">{t('errorLoading')}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[12px] text-xs font-bold shadow-md shadow-indigo-600/10 active:scale-95 transition-all outline-none"
          >
            Retry Connection
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <NotificationTable notifications={notifications} meta={meta} stats={stats} />
      )}
    </div>
  );
}
