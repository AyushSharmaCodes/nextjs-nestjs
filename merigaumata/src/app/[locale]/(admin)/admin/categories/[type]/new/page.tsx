"use client";

import { logger } from '@/shared/lib/logger';
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import { CategoryType, Category } from '@/features/categories/types';
import { mockCategoriesApi } from '@/features/categories/services/mockApi';
import { Skeleton } from '@/shared/components/Skeleton';
import { useTranslations } from 'next-intl';

export default function NewCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('categories');

  const categoryType = (params?.type || 'product') as CategoryType;
  const parentIdFromQuery = searchParams?.get('parentId') || null;

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sibling references for parents selection
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const data = await mockCategoriesApi.getCategories(categoryType);
        setAllCategories(data);
      } catch (err) {
        logger.error(`Failed reference lists load:: {error}`, { error: String(err) });
      } finally {
        setLoading(false);
      }
    };
    loadReferences();
  }, [categoryType]);

  const handleSave = async (formData: any) => {
    try {
      // Inject standard fields
      const savePayload = {
        ...formData,
        parentId: formData.parentId || parentIdFromQuery
      };
      await mockCategoriesApi.saveCategory(savePayload);
      alert(t('successCreate'));
      router.push('/admin/categories');
    } catch (err) {
      logger.error(`Save failed:: {error}`, { error: String(err) });
      alert('Failed saving category node. Please verify validations.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" width="100%" height={80} />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="col-span-2" variant="rectangular" width="100%" height={400} />
          <Skeleton variant="rectangular" width="100%" height={240} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb navigator */}
      <div className="flex gap-2 text-xs text-foreground/40 font-semibold select-none text-left">
        <span className="cursor-pointer hover:text-foreground" onClick={() => router.push('/admin')}>Admin</span>
        <span>/</span>
        <span className="cursor-pointer hover:text-foreground" onClick={() => router.push('/admin/categories')}>Categories</span>
        <span>/</span>
        <span className="text-foreground capitalize">Establish {categoryType}</span>
      </div>

      <CategoryForm
        categoryType={categoryType}
        allCategories={allCategories}
        onSave={handleSave}
        onCancel={() => router.push('/admin/categories')}
      />

    </div>
  );
}
