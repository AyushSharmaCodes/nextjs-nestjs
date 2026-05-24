"use client";

import { logger } from '@/shared/lib/logger';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import { CategoryType, Category } from '@/features/categories/types';
import { mockCategoriesApi } from '@/features/categories/services/mockApi';
import { Skeleton } from '@/shared/components/Skeleton';
import { useTranslations } from 'next-intl';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('categories');

  const categoryType = (params?.type || 'product') as CategoryType;
  const categoryId = params?.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryAndReferences = async () => {
      try {
        const [targetNode, references] = await Promise.all([
          mockCategoriesApi.getCategoryById(categoryId),
          mockCategoriesApi.getCategories(categoryType)
        ]);
        
        if (!targetNode) {
          alert('Error: Category record was not found in catalog.');
          router.push('/admin/categories');
          return;
        }

        setCategory(targetNode);
        setAllCategories(references);
      } catch (err: unknown) {
        logger.error(`Failed loading categories details:: {error}`, { error: String(err) });
      } finally {
        setLoading(false);
      }
    };
    
    if (categoryId) {
      loadCategoryAndReferences();
    }
  }, [categoryId, categoryType]);

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      await mockCategoriesApi.updateCategory(categoryId, formData);
      alert(t('successUpdate'));
      router.push('/admin/categories');
    } catch (err: unknown) {
      logger.error(`Update failed:: {error}`, { error: String(err) });
      alert('Failed updating category node. Please verify validations.');
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
    <div className="space-y-6 animate-fade-in">
      
      {/* Breadcrumb navigator */}
      <div className="flex gap-2 text-xs text-foreground/40 font-semibold select-none text-left">
        <span className="cursor-pointer hover:text-foreground" onClick={() => router.push('/admin')}>Admin</span>
        <span>/</span>
        <span className="cursor-pointer hover:text-foreground" onClick={() => router.push('/admin/categories')}>Categories</span>
        <span>/</span>
        <span className="text-foreground capitalize">Edit {category?.translations.en?.name || categoryType}</span>
      </div>

      {category && (
        <CategoryForm
          categoryType={categoryType}
          initialData={category}
          allCategories={allCategories}
          onSave={handleSave}
          onCancel={() => router.push('/admin/categories')}
        />
      )}

    </div>
  );
}
