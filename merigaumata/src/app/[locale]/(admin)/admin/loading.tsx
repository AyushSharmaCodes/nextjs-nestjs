'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import AdminSkeleton from '@/shared/ui/loading/skeletons/admin-skeleton';

export default function AdminLoading() {
  const t = useTranslations('loading');

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-6">
      {/* Visual notification tag */}
      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-medium text-xs pb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        <span>{t('admin')}</span>
      </div>
      
      {/* Main Admin Dashboard Panel skeleton */}
      <AdminSkeleton />
    </div>
  );
}
