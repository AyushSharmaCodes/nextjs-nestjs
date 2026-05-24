"use client";

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Trash2, X, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useDuplicateProduct,
  useArchiveProduct,
  useBulkDeleteProducts,
  useBulkArchiveProducts,
} from '../../hooks/use-products';
import { Product } from '../../types/products.types';
import { ProductsHeader } from './ProductsHeader';
import { ProductToolbar } from './ProductToolbar';
import { AdminProductCard } from './AdminProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductEmptyState } from './ProductEmptyState';
import { ProductErrorState } from './ProductErrorState';
import { ProductPagination } from './ProductPagination';
import { ProductDrawerForm } from './ProductDrawerForm';
import { ProductPreviewModal } from './ProductPreviewModal';

export function ProductsPageLayout() {
  const t = useTranslations('products');

  // Unified dynamic filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low-high' | 'price-high-low' | 'rating' | 'newest'>('featured');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Selected item mappings for bulk action utilities
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // HD Preview modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewingProduct, setPreviewingProduct] = useState<Product | null>(null);

  // Load active paginated filtered products
  const { data, isLoading, isError, error, refetch } = useProducts({
    search: searchQuery,
    category: selectedCategory,
    status,
    sortBy,
    page,
    limit,
  });

  // Load all products (without page limits) for dynamic metrics aggregation & export parsing
  const { data: rawAllData } = useProducts({
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'featured',
    page: 1,
    limit: 9999,
  });

  const allProducts = rawAllData?.products || [];
  const activeProductsList = data?.products || [];
  const totalCount = data?.total || 0;

  // Generate unique categories dynamically from seeded products
  const dynamicCategories = useMemo(() => {
    const unique = new Set(allProducts.map((p) => p.category));
    return Array.from(unique);
  }, [allProducts]);

  // Generate dynamic search suggestions matching active inputs
  const searchSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    const queryLower = searchQuery.toLowerCase();
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(queryLower))
      .map((p) => p.name)
      .slice(0, 5);
  }, [searchQuery, allProducts]);

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const duplicateProductMutation = useDuplicateProduct();
  const archiveProductMutation = useArchiveProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();
  const bulkArchiveMutation = useBulkArchiveProducts();

  // Reset all filters utility
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStatus('all');
    setSortBy('featured');
    setPage(1);
  };

  // Bulk selectors
  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    const activePageIds = activeProductsList.map((p) => p.id);
    const allSelected = activePageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Remove current page items
      setSelectedIds((prev) => prev.filter((id) => !activePageIds.includes(id)));
    } else {
      // Add current page items (avoiding duplicates)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...activePageIds])));
    }
  };

  // Triggers
  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handlePreviewClick = (product: Product) => {
    setPreviewingProduct(product);
    setIsPreviewOpen(true);
  };

  // CRUD submits
  const handleFormSubmit = async (inputData: any) => { // ts-audit-ignore
    if (editingProduct) {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        updates: inputData,
      });
    } else {
      await createProductMutation.mutateAsync(inputData);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateProductMutation.mutateAsync(id);
  };

  const handleArchive = async (id: string) => {
    await archiveProductMutation.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action is permanent.')) {
      await deleteProductMutation.mutateAsync(id);
      // Remove from selections if present
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Bulk submits
  const handleBulkDeleteSubmit = async () => {
    if (
      confirm(
        `Are you sure you want to permanently delete these ${selectedIds.length} products?`
      )
    ) {
      await bulkDeleteMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkArchiveSubmit = async () => {
    await bulkArchiveMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  // Layout motion configurations
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-20 relative">
      {/* 1. Header with dynamic stock analytics metrics dashboard */}
      <ProductsHeader products={allProducts} />

      {/* 2. Control center toolbar row */}
      <ProductToolbar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1); // Reset page to 1 on search
        }}
        searchSuggestions={searchSuggestions}
        categories={dynamicCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        status={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(sb) => {
          setSortBy(sb as any); // ts-audit-ignore
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onAddProduct={handleAddClick}
        allProductsForExport={allProducts}
      />

      {/* Bulk action checkbox on table grid bar if elements loaded */}
      {activeProductsList.length > 0 && !isLoading && (
        <div className="flex items-center gap-2 select-none px-1 text-xs text-stone-500 font-medium">
          <input
            type="checkbox"
            checked={
              activeProductsList.length > 0 &&
              activeProductsList.every((p) => selectedIds.includes(p.id))
            }
            onChange={handleSelectAllToggle}
            className="h-3.5 w-3.5 rounded border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-0 cursor-pointer"
            id="selectAllCheckbox"
          />
          <label htmlFor="selectAllCheckbox" className="cursor-pointer">
            Select All Products on This Page
          </label>
        </div>
      )}

      {/* 3. Grid Display List area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {Array.from({ length: limit }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ProductErrorState error={error || 'Cache collection failure'} onRetry={refetch} />
      ) : activeProductsList.length === 0 ? (
        <ProductEmptyState onClearFilters={handleResetFilters} />
      ) : (
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          layoutId="productsGrid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
        >
          {activeProductsList.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              isSelected={selectedIds.includes(product.id)}
              onSelectToggle={() => handleSelectToggle(product.id)}
              onPreview={() => handlePreviewClick(product)}
              onEdit={() => handleEditClick(product)}
              onDuplicate={() => handleDuplicate(product.id)}
              onArchive={() => handleArchive(product.id)}
              onDelete={() => handleDelete(product.id)}
              isDuplicating={duplicateProductMutation.isPending && duplicateProductMutation.variables === product.id}
              isArchiving={archiveProductMutation.isPending && archiveProductMutation.variables === product.id}
              isDeleting={deleteProductMutation.isPending && deleteProductMutation.variables === product.id}
            />
          ))}
        </motion.div>
      )}

      {/* 4. Interactive Page selector bar */}
      {!isLoading && !isError && activeProductsList.length > 0 && (
        <ProductPagination
          page={page}
          limit={limit}
          total={totalCount}
          onPageChange={setPage}
        />
      )}

      {/* 5. Bottom floating action bar overlay for Multi-Selections */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-6 inset-x-4 max-w-lg mx-auto bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950 p-3.5 border border-stone-800 dark:border-stone-250 rounded-2xl shadow-2xl flex items-center justify-between gap-4 z-40"
          >
            <div className="flex items-center gap-2 px-1">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-bold font-mono">
                {t('selectedCount', { count: selectedIds.length })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Archive Selections */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkArchiveSubmit}
                disabled={bulkArchiveMutation.isPending}
                className="h-8 text-xs font-bold rounded-lg text-stone-300 hover:text-white dark:text-stone-700 dark:hover:text-stone-905 flex items-center gap-1 cursor-pointer select-none"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Archive</span>
              </Button>

              {/* Delete Selections */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDeleteSubmit}
                disabled={bulkDeleteMutation.isPending}
                className="h-8 text-xs font-bold rounded-lg text-rose-400 hover:text-rose-300 dark:text-rose-600 dark:hover:text-rose-700 flex items-center gap-1 cursor-pointer select-none"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>

              {/* Wipe selections */}
              <button
                onClick={() => setSelectedIds([])}
                className="h-7 w-7 rounded-full bg-stone-850 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-400 dark:text-stone-500 flex items-center justify-center cursor-pointer select-none"
                aria-label="Wipe selections"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Form workspace drawers & Quick HD previews */}
      <ProductDrawerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        isSubmitting={createProductMutation.isPending || updateProductMutation.isPending}
      />

      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewingProduct(null);
        }}
        product={previewingProduct}
      />
    </div>
  );
}
