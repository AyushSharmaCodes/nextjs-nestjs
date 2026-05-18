'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import EventSkeleton from '@/shared/ui/loading/skeletons/event-skeleton';

export default function EventsLoading() {
  const t = useTranslations('loading');

  return (
    <div className="pt-28 pb-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <EventSkeleton />
    </div>
  );
}
