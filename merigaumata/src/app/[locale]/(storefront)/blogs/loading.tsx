'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import BlogSkeleton from '@/shared/ui/loading/skeletons/blog-skeleton';

export default function BlogsLoading() {
  const t = useTranslations('loading');

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <BlogSkeleton />
    </div>
  );
}
