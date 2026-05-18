"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Package, Calendar, Tag, ShieldCheck, CheckCircle2, Bookmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Product } from '../../types/products.types';
import { ProductImage } from './ProductImage';
import { ProductBadge } from './ProductBadge';
import { ProductPrice } from './ProductPrice';
import { ProductInventory } from './ProductInventory';

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductPreviewModal({ isOpen, onClose, product }: ProductPreviewModalProps) {
  const t = useTranslations('products');

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-40 pointer-events-auto"
          />

          {/* Centered Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-250 dark:border-stone-850 overflow-hidden flex flex-col pointer-events-auto max-h-[85vh]"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-stone-150 dark:border-stone-850/80 flex items-center justify-between bg-white dark:bg-stone-900 shrink-0">
                <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                  <Eye className="h-4.5 w-4.5" />
                  <span className="text-xs uppercase font-bold tracking-wider">HD Catalog Quick Preview</span>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrolling Detail Content */}
              <div className="flex-grow overflow-y-auto scrollbar-none p-6 flex flex-col md:flex-row gap-6">
                
                {/* Left column - Visual & pricing */}
                <div className="flex flex-col gap-4 w-full md:w-5/12 shrink-0">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    containerClassName="w-full aspect-square rounded-2xl border border-stone-150 dark:border-stone-800"
                    className="hover:scale-105"
                  />

                  {/* Pricing detail */}
                  <div className="p-4 bg-stone-50/50 dark:bg-stone-900/20 border border-stone-200/50 dark:border-stone-800/80 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
                      Active Valuation
                    </span>
                    <ProductPrice
                      price={product.price}
                      mrp={product.mrp}
                      priceClassName="text-xl"
                    />
                  </div>

                  {/* Inventory state */}
                  <div className="p-4 bg-stone-50/50 dark:bg-stone-900/20 border border-stone-200/50 dark:border-stone-800/80 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-2">
                      Inventory Logistics
                    </span>
                    <ProductInventory
                      stock={product.stock}
                      soldCount={product.soldCount}
                    />
                  </div>
                </div>

                {/* Right column - Metadata & Descriptions */}
                <div className="flex flex-col gap-5 flex-grow">
                  {/* Name and State tags */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      {product.status && (
                        <ProductBadge variant={product.status}>
                          {t(product.status)}
                        </ProductBadge>
                      )}
                      <ProductBadge variant="default" className="capitalize">
                        {product.category}
                      </ProductBadge>
                    </div>
                    <h2 className="font-serif font-bold text-xl md:text-2xl text-stone-950 dark:text-stone-50 tracking-tight">
                      {product.name}
                    </h2>
                  </div>

                  {/* Descriptions */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500">
                      Product Story & Sourcing
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                      {product.description || 'No detailed Vedic description available for this item yet.'}
                    </p>
                  </div>

                  {/* Sourcing details list */}
                  <div className="border-t border-stone-150 dark:border-stone-850 pt-4 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 mb-1">
                      Sanctuary Sourcing Parameters
                    </span>

                    {/* Sourcing values */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>100% Pure & Vedic</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Cruelty-Free Cow Seva</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                        <Bookmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Eco-Friendly Packaged</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                        <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Freshly Handcrafted</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical values: ID & Slug */}
                  <div className="border-t border-stone-150 dark:border-stone-850 pt-4 mt-auto text-[10px] text-stone-400 dark:text-stone-500 font-mono flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>PRODUCT_ID:</span>
                      <span className="font-bold text-stone-500 dark:text-stone-450">{product.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>URL_SLUG_PATH:</span>
                      <span className="font-bold text-stone-500 dark:text-stone-450">/catalog/{product.category}/{product.slug}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Action buttons */}
              <div className="p-4 border-t border-stone-150 dark:border-stone-850 flex items-center justify-end bg-white dark:bg-stone-900 shrink-0">
                <Button
                  onClick={onClose}
                  size="sm"
                  className="h-9 px-5 text-xs bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 font-bold rounded-xl cursor-pointer"
                >
                  Close Preview
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
