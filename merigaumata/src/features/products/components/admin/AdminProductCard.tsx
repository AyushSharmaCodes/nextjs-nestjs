"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '../../types/products.types';
import { ProductImage } from './ProductImage';
import { ProductBadge } from './ProductBadge';
import { ProductPrice } from './ProductPrice';
import { ProductInventory } from './ProductInventory';
import { ProductMetadata } from './ProductMetadata';
import { ProductQuickActions } from './ProductQuickActions';
import { ProductCardMenu } from './ProductCardMenu';
import { useTranslations } from 'next-intl';

interface AdminProductCardProps {
  product: Product;
  isSelected?: boolean;
  onSelectToggle?: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isDuplicating?: boolean;
  isArchiving?: boolean;
  isDeleting?: boolean;
}

export function AdminProductCard({
  product,
  isSelected = false,
  onSelectToggle,
  onPreview,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  isDuplicating = false,
  isArchiving = false,
  isDeleting = false,
}: AdminProductCardProps) {
  const t = useTranslations('products');

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' as const }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -3 }}
      className={clsx(
        'group relative flex flex-col h-full bg-white dark:bg-stone-900/60 rounded-2xl border transition-all duration-300 overflow-hidden outline-none focus-within:ring-2 focus-within:ring-stone-900/10 focus-within:border-stone-400 dark:focus-within:ring-stone-100/10 dark:focus-within:border-stone-600',
        isSelected
          ? 'border-stone-900 dark:border-stone-100 shadow-md ring-1 ring-stone-900 dark:ring-stone-100'
          : 'border-stone-200/80 dark:border-stone-850 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-800/50'
      )}
    >
      {/* Top action row */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
        {/* Bulk Selection Checkbox */}
        <div className="pointer-events-auto">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectToggle}
            className="h-4 w-4 bg-white/90 dark:bg-stone-900/90 border-stone-300 dark:border-stone-700 data-[state=checked]:bg-stone-900 data-[state=checked]:text-white dark:data-[state=checked]:bg-stone-100 dark:data-[state=checked]:text-stone-900 rounded shadow"
            aria-label={`Select ${product.name}`}
          />
        </div>

        {/* Action Menu (dropdown context) & State badge */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {product.status && (
            <ProductBadge variant={product.status}>
              {t(product.status)}
            </ProductBadge>
          )}
          <ProductCardMenu
            onPreview={onPreview}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onDelete={onDelete}
            isDuplicating={isDuplicating}
            isArchiving={isArchiving}
            isDeleting={isDeleting}
          />
        </div>
      </div>

      {/* Middle Interactive product image */}
      <div 
        onClick={onPreview}
        className="cursor-pointer relative aspect-square overflow-hidden"
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          containerClassName="h-full w-full"
          className="group-hover:scale-105"
        />

        {/* Floating Quick Action Overlay */}
        <ProductQuickActions
          onPreview={onPreview}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          isDuplicating={isDuplicating}
          isArchiving={isArchiving}
        />
      </div>

      {/* Bottom detailed information panel */}
      <div className="flex flex-col flex-grow p-4 gap-3 bg-white dark:bg-stone-900/40 border-t border-stone-100/50 dark:border-stone-800/40">
        
        {/* Title */}
        <div onClick={onPreview} className="cursor-pointer">
          <h3 className="font-serif font-bold text-[15px] text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors duration-200">
            {product.name}
          </h3>
        </div>

        {/* Pricing info */}
        <ProductPrice
          price={product.price}
          mrp={product.mrp}
        />

        {/* Category tag & Rating metadata */}
        <ProductMetadata product={product} />

        {/* Divider line */}
        <div className="border-t border-stone-100 dark:border-stone-800/80 my-0.5" />

        {/* Stock tracking indicator */}
        <ProductInventory
          stock={product.stock}
          soldCount={product.soldCount}
        />
      </div>
    </motion.div>
  );
}
