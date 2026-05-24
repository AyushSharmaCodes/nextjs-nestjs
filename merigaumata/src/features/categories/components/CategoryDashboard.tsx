"use client";

import { logger } from '@/shared/lib/logger';
import React, { useState, useEffect } from 'react';
import { AppIcon } from '@/shared/icons';
import { Category, CategoryType } from '../types';
import { mockCategoriesApi } from '../services/mockApi';
import { CategoryTreeView } from './CategoryTreeView';
import { Skeleton } from '@/shared/components/Skeleton';
import { useRouter } from '@/i18n/navigation';
import clsx from 'clsx';

interface CategoryDashboardProps {
  categoryType: CategoryType;
  onChangeCategoryType: (type: CategoryType) => void;
}

export function CategoryDashboard({
  categoryType,
  onChangeCategoryType
}: CategoryDashboardProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [translationFilter, setTranslationFilter] = useState<'all' | 'fully' | 'partially'>('all');
  const [depthFilter, setDepthFilter] = useState<string>('all');

  // Bulk operation tracking
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Load categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await mockCategoriesApi.getCategories(categoryType);
      setCategories(data);
    } catch (err: unknown) {
      logger.error(`Failed to load categories:: {error}`, { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    setSelectedIds(new Set());
  }, [categoryType]);

  // Handle reorders
  const handleReorder = async (reorderedItems: { id: string; parentId: string | null; sortOrder: number }[]) => {
    // Optimistic update
    const updated = [...categories];
    reorderedItems.forEach(item => {
      const index = updated.findIndex(c => c.id === item.id);
      if (index !== -1) {
        updated[index] = { ...updated[index], parentId: item.parentId, sortOrder: item.sortOrder };
      }
    });
    setCategories(updated);

    try {
      await mockCategoriesApi.reorderCategories(reorderedItems);
      // Fetch fresh tree to sync details
      const fresh = await mockCategoriesApi.getCategories(categoryType);
      setCategories(fresh);
    } catch (err: unknown) {
      logger.error(`Reorder update failed, falling back:: {error}`, { error: String(err) });
      fetchCategories();
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, active: boolean) => {
    // Optimistic update
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: active } : c));
    try {
      await mockCategoriesApi.updateCategory(id, { isActive: active });
    } catch (err: unknown) {
      logger.error(`Failed to toggle active:: {error}`, { error: String(err) });
      fetchCategories();
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Sub-categories will be re-assigned under its parent.')) return;
    try {
      await mockCategoriesApi.deleteCategory(id, false);
      fetchCategories();
    } catch (err: unknown) {
      logger.error(`Delete failed:: {error}`, { error: String(err) });
    }
  };

  // Add child helper
  const handleAddSub = (parentId: string) => {
    router.push(`/admin/categories/${categoryType}/new?parentId=${parentId}`);
  };

  // Bulk delete operation
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you absolutely sure you want to delete these ${selectedIds.size} categories?`)) return;
    
    setIsBulkOperating(true);
    try {
      for (const id of Array.from(selectedIds)) {
        await mockCategoriesApi.deleteCategory(id, false);
      }
      setSelectedIds(new Set());
      fetchCategories();
    } catch (err: unknown) {
      logger.error(`Bulk deletion failed:: {error}`, { error: String(err) });
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Export categories to JSON Schema
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prodex-${categoryType}-categories.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Simulated JSON Schema import
  const handleImportJSON = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = async (e: any) => { // ts-audit-ignore
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event: any) => { // ts-audit-ignore
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            setLoading(true);
            await mockCategoriesApi.importCategories(parsed);
            fetchCategories();
            alert('Categories database successfully imported and merged!');
          } else {
            alert('Invalid Schema: JSON must contain an array of category definitions.');
          }
        } catch (err: unknown) {
          alert('Failed parsing file. Ensure it is a valid JSON schema.');
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  };

  // Filter & Search computation
  const getFilteredCategories = () => {
    return categories.filter(c => {
      // 1. Search Query
      const enName = c.translations.en?.name?.toLowerCase() || '';
      const hiName = c.translations.hi?.name?.toLowerCase() || '';
      const desc = c.translations.en?.description?.toLowerCase() || '';
      const slugVal = c.slug.toLowerCase();
      const matchesSearch = 
        enName.includes(searchQuery.toLowerCase()) || 
        hiName.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase()) || 
        slugVal.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Operational filter
      if (activeFilter === 'active' && !c.isActive) return false;
      if (activeFilter === 'draft' && c.isActive) return false;

      // 3. Translations completeness
      const isFullyTranslated = c.translations.en?.name && c.translations.hi?.name && c.translations.en?.description && c.translations.hi?.description;
      const isPartiallyTranslated = (c.translations.en?.name || c.translations.hi?.name) && !isFullyTranslated;
      
      if (translationFilter === 'fully' && !isFullyTranslated) return false;
      if (translationFilter === 'partially' && !isPartiallyTranslated) return false;

      return true;
    });
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="space-y-6">
      
      {/* Category Module tabs Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-earth-200/80 pb-5">
        
        {/* Domain Navigation Tabs */}
        <div className="flex bg-card border border-earth-200 rounded-2xl p-1 shadow-sm max-w-full overflow-x-auto gap-0.5">
          {[
            { id: 'product', label: 'Products', icon: 'products', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
            { id: 'event', label: 'Events', icon: 'events', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
            { id: 'blog', label: 'Wisdom Blogs', icon: 'bookOpen', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
            { id: 'faq', label: 'FAQs / Help', icon: 'help', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' }
          ].map(tab => {
            const isSelected = categoryType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeCategoryType(tab.id as CategoryType)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-serif tracking-tight transition-all whitespace-nowrap",
                  isSelected 
                    ? "bg-foreground text-background font-bold shadow-md" 
                    : "text-foreground/60 hover:text-foreground hover:bg-earth-100/50"
                )}
              >
                <div className={clsx(
                  "p-1 rounded-lg transition-colors flex items-center justify-center", 
                  isSelected ? "bg-background/20 text-background" : tab.color
                )}>
                  <AppIcon name={tab.icon as any} className="h-4 w-4" /> // ts-audit-ignore
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Global Action Add button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-2 border border-earth-200 text-foreground/70 hover:bg-earth-50 rounded-xl hover:text-foreground transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Export Categories Database Schema"
          >
            <AppIcon name="download" className="h-4 w-4" />
            <span>Export</span>
          </button>
          
          <button
            type="button"
            onClick={handleImportJSON}
            className="p-2 border border-earth-200 text-foreground/70 hover:bg-earth-50 rounded-xl hover:text-foreground transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Import Categories Database Schema"
          >
            <AppIcon name="upload" className="h-4 w-4" />
            <span>Import</span>
          </button>

          <div className="w-px bg-earth-200 my-1 mx-1"></div>

          <button
            type="button"
            onClick={() => router.push(`/admin/categories/${categoryType}/new`)}
            className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <AppIcon name="plus" className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-card border border-earth-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <AppIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-foreground/35" />
            <input
              type="text"
              placeholder={`Search in ${categoryType} categories catalog by name, slug or metadata...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            />
          </div>

          {/* Filter toggler */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "px-4 py-2.5 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 w-full md:w-auto transition-all",
              showFilters 
                ? "bg-earth-100 border-primary-500 text-primary-600 font-bold" 
                : "border-earth-200 text-foreground/70 hover:bg-earth-50"
            )}
          >
            <AppIcon name="filter" className="h-4 w-4" />
            Advanced Filters
          </button>
        </div>

        {/* Collapsible Filters shelf */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-earth-100 animate-fade-in text-left">
            
            {/* Active state filter */}
            <div>
              <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2">
                Operational Status
              </label>
              <div className="flex bg-earth-50 border border-earth-200 rounded-xl p-0.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'draft', label: 'Draft' }
                ].map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setActiveFilter(op.id as any)} // ts-audit-ignore
                    className={clsx(
                      "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                      activeFilter === op.id 
                        ? "bg-card text-foreground shadow-sm font-bold" 
                        : "text-foreground/50 hover:text-foreground"
                    )}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Translation state filter */}
            <div>
              <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2">
                Intl Localization progress
              </label>
              <select
                value={translationFilter}
                onChange={(e) => setTranslationFilter(e.target.value as any)} // ts-audit-ignore
                className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-background text-xs"
              >
                <option value="all">All Translation Nodes</option>
                <option value="fully">Fully Translated (EN & HI)</option>
                <option value="partially">Missing Translation (Hindi/Other)</option>
              </select>
            </div>

            {/* Bulk items selector summary */}
            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between text-xs text-foreground/50 bg-earth-50 rounded-xl p-3 border border-earth-200">
                <span className="flex items-center gap-1">
                  <AppIcon name="layers" className="h-4 w-4 text-primary-500" />
                  Hierarchy depth limits:
                </span>
                <span className="font-bold text-foreground">
                  {categoryType === 'product' ? 'Max 5 levels' : 'Max 3 levels'}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Hierarchy Recursive tree list content */}
      {loading ? (
        <div className="space-y-4">
          <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="flex-1 space-y-1.5">
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="20%" height={10} />
              </div>
            </div>
            <Skeleton variant="rectangular" width="100%" height={100} />
          </div>
        </div>
      ) : (
        <CategoryTreeView
          categories={filteredCategories}
          categoryType={categoryType}
          onEdit={(id) => router.push(`/admin/categories/${categoryType}/${id}/edit`)}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onReorder={handleReorder}
          onAddSub={handleAddSub}
        />
      )}

    </div>
  );
}
