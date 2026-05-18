'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import PageLoader from '@/shared/ui/loading/page-loader';

export default function RootLoading() {
  const t = useTranslations('loading');
  return <PageLoader message={t('generic')} />;
}
