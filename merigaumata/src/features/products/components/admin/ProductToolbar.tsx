import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Filter, FileSpreadsheet, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductSearch } from './ProductSearch';
import { ProductCategoryTabs } from './ProductCategoryTabs';
import { ProductFilters } from './ProductFilters';
import { Product } from '../../types/products.types';

interface ProductToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchSuggestions?: string[];

  // Category
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;

  // Advanced Filters
  status: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onResetFilters: () => void;

  // Actions
  onAddProduct: () => void;
  allProductsForExport: Product[];
}

export function ProductToolbar({
  searchQuery,
  onSearchChange,
  searchSuggestions = [],
  categories,
  selectedCategory,
  onCategoryChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  onAddProduct,
  allProductsForExport,
}: ProductToolbarProps) {
  const t = useTranslations('products');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Check if advanced filters are active (non-default)
  const isFilterActive = status !== 'all' || sortBy !== 'featured';
  const filterCount = (status !== 'all' ? 1 : 0) + (sortBy !== 'featured' ? 1 : 0);

  // High-fidelity CSV Exporter
  const handleExportCSV = () => {
    if (allProductsForExport.length === 0) return;

    const headers = ['ID', 'Name', 'Slug', 'Category', 'Price', 'MRP', 'Stock', 'Sold', 'Status', 'Featured'];
    const rows = allProductsForExport.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.slug,
      p.category,
      p.price,
      p.mrp || '',
      p.stock,
      p.soldCount || 0,
      p.status || 'active',
      p.featured ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `products-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top search & controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-stone-900/40 p-4 border border-stone-200/80 dark:border-stone-850 rounded-2xl shadow-sm">
        
        {/* Debounced Search */}
        <ProductSearch
          value={searchQuery}
          onChange={onSearchChange}
          suggestions={searchSuggestions}
        />

        {/* Action button grouping */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Advanced Filter Toggler */}
          <Button
            variant={isFilterActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="h-9 text-xs flex items-center gap-1.5 rounded-full select-none cursor-pointer border-stone-250 dark:border-stone-800"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
            {isFilterActive && (
              <span className="ml-1 bg-amber-600 text-white dark:bg-amber-500 rounded-full h-4 min-w-4 flex items-center justify-center text-[9px] px-1 font-bold">
                {filterCount}
              </span>
            )}
          </Button>

          {/* Premium Exporter */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 text-xs flex items-center gap-1.5 rounded-full select-none cursor-pointer border-stone-250 dark:border-stone-800 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>{t('exportBtn')}</span>
          </Button>

          {/* Add product CTA */}
          <Button
            onClick={onAddProduct}
            size="sm"
            className="h-9 text-xs bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 flex items-center gap-1.5 rounded-full select-none cursor-pointer font-bold shadow-md ml-auto md:ml-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addBtn')}</span>
          </Button>
        </div>

      </div>

      {/* Advanced Filters Shelf */}
      <ProductFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        status={status}
        onStatusChange={onStatusChange}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        onReset={() => {
          onResetFilters();
          setIsFiltersOpen(false);
        }}
      />

      {/* Categories Horizontal Tabs bar */}
      <ProductCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onChange={onCategoryChange}
      />
    </div>
  );
}
