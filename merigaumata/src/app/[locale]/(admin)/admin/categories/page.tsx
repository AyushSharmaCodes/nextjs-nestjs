"use client";

import React, { useState } from 'react';
import { CategoryDashboard } from '@/features/categories/components/CategoryDashboard';
import { CategoryType } from '@/features/categories/types';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

export default function AdminCategoriesPage() {
  const t = useTranslations('categories');
  const [categoryType, setCategoryType] = useState<CategoryType>('product');

  return (
    <div className="space-y-6 text-left">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col gap-1.5 border-b border-earth-100 pb-4">
        <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Platform Catalog Core
        </div>
        <h1 className="text-2xl font-serif font-extrabold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="text-xs text-foreground/50 max-w-2xl leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Main Categories Panel */}
      <CategoryDashboard 
        categoryType={categoryType} 
        onChangeCategoryType={setCategoryType} 
      />

    </div>
  );
}
