"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { adminProductSchema, AdminProductInput } from '../../schemas/adminProducts.schema';
import { Product } from '../../types/products.types';

interface ProductDrawerFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // If provided, we are editing; if null, we are adding
  onSubmit: (data: AdminProductInput) => Promise<void>;
  isSubmitting?: boolean;
}

const SAMPLE_IMAGES = [
  { label: 'Desi Vedic Ghee', url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&auto=format&fit=crop&q=80' },
  { label: 'Organic A2 Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80' },
  { label: 'Sacred Puja Dhoop', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80' },
  { label: 'Natural Sprout Soil', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&auto=format&fit=crop&q=80' }
];

const CATEGORIES = ['dairy', 'agriculture', 'spiritual', 'wellness'];

export function ProductDrawerForm({
  isOpen,
  onClose,
  product,
  onSubmit,
  isSubmitting = false
}: ProductDrawerFormProps) {
  const t = useTranslations('products');
  const [formData, setFormData] = useState<AdminProductInput>({
    name: '',
    slug: '',
    price: 0,
    mrp: null,
    category: 'dairy',
    stock: 10,
    description: '',
    imageUrl: '',
    featured: false,
    isSale: false,
    status: 'active',
    soldCount: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load product data when editing
  useEffect(() => {
    if (isOpen) {
      setSaveSuccess(false);
      setErrors({});
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug,
          price: product.price,
          mrp: product.mrp || null,
          category: product.category,
          stock: product.stock,
          description: product.description,
          imageUrl: product.imageUrl,
          featured: product.featured || false,
          isSale: product.isSale || false,
          status: product.status || 'active',
          soldCount: product.soldCount || 0
        });
      } else {
        // Reset for addition
        setFormData({
          name: '',
          slug: '',
          price: 0,
          mrp: null,
          category: 'dairy',
          stock: 10,
          description: '',
          imageUrl: '',
          featured: false,
          isSale: false,
          status: 'active',
          soldCount: 0
        });
      }
    }
  }, [product, isOpen]);

  // Handle auto-generation of URL Slug
  const handleGenerateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove spec chars
      .replace(/[\s_-]+/g, '-') // swap spaces with dash
      .replace(/^-+|-+$/g, ''); // trim edge dash
    
    setFormData(prev => ({ ...prev, slug }));
    if (errors.slug) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.slug;
        return copy;
      });
    }
  };

  const handleInputChange = (field: keyof AdminProductInput, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    // Clear errors inline
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Perform Zod validation
    const result = adminProductSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        fieldErrors[path] = t(issue.message); // Translate the error key
      });
      setErrors(fieldErrors);
      
      // Scroll form to top to see validation notice
      const scrollContainer = document.getElementById('drawer-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      await onSubmit(result.data);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrors({ global: err.message || 'An unexpected saving error occurred.' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 pointer-events-auto"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-250 dark:border-stone-850 z-50 flex flex-col pointer-events-auto"
          >
            {/* Header row */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="font-serif font-bold text-lg text-stone-950 dark:text-stone-50 select-none">
                  {product ? t('editBtn') : t('addBtn')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer select-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrolling Form Fields area */}
            <div
              id="drawer-scroll-container"
              className="flex-grow overflow-y-auto scrollbar-none p-6"
            >
              {saveSuccess ? (
                <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                  <CheckCircle className="h-14 w-14 text-emerald-500 animate-bounce mb-4" />
                  <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    {product ? t('successUpdate') : t('successCreate')}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">Syncing administrative catalog...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="flex flex-col gap-5">
                  {/* General Error notice */}
                  {errors.global && (
                    <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 p-3 rounded-xl text-xs font-semibold">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errors.global}</span>
                    </div>
                  )}

                  {/* Product Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {t('name')} <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Premium Vedic Bilona Ghee"
                      className="h-10 text-xs bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                    {errors.name && (
                      <span className="text-[10px] text-rose-600 font-semibold">{errors.name}</span>
                    )}
                  </div>

                  {/* Slug address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span>{t('slug')} <span className="text-rose-500">*</span></span>
                      {formData.name && (
                        <button
                          type="button"
                          onClick={handleGenerateSlug}
                          className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          Generate Slug
                        </button>
                      )}
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.slug || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('slug', e.target.value)}
                      placeholder="e.g. premium-vedic-bilona-ghee"
                      className="h-10 text-xs bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                    {errors.slug && (
                      <span className="text-[10px] text-rose-600 font-semibold">{errors.slug}</span>
                    )}
                  </div>

                  {/* Pricing grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sale Price */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {t('price')} <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('price', e.target.value)}
                        placeholder="450"
                        className="h-10 text-xs bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl"
                      />
                      {errors.price && (
                        <span className="text-[10px] text-rose-600 font-semibold">{errors.price}</span>
                      )}
                    </div>

                    {/* MRP original price */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {t('mrp')}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.mrp ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mrp', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="e.g. 500"
                        className="h-10 text-xs bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl"
                      />
                      {errors.mrp && (
                        <span className="text-[10px] text-rose-600 font-semibold">{errors.mrp}</span>
                      )}
                    </div>
                  </div>

                  {/* Category select & Available Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {t('category')} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('category', e.target.value)}
                        className="h-10 text-xs px-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl outline-none focus:border-stone-400 dark:focus:border-stone-600 shadow-sm"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="capitalize">
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <span className="text-[10px] text-rose-600 font-semibold">{errors.category}</span>
                      )}
                    </div>

                    {/* Stock level */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {t('stock')} <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="number"
                        required
                        min="0"
                        value={formData.stock ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('stock', e.target.value)}
                        placeholder="10"
                        className="h-10 text-xs bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl"
                      />
                      {errors.stock && (
                        <span className="text-[10px] text-rose-600 font-semibold">{errors.stock}</span>
                      )}
                    </div>
                  </div>

                  {/* Image URL input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {t('imageUrl')} <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="url"
                      required
                      value={formData.imageUrl || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="h-10 text-xs bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                    {errors.imageUrl && (
                      <span className="text-[10px] text-rose-600 font-semibold">{errors.imageUrl}</span>
                    )}

                    {/* Quick Image clicks */}
                    <div className="flex flex-col gap-1.5 mt-1 border border-stone-150 dark:border-stone-800/80 p-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/20">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>Pre-seeded High-Res Assets (Click to Apply)</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {SAMPLE_IMAGES.map((img, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleInputChange('imageUrl', img.url)}
                            className="px-2 py-1 text-[10px] font-semibold bg-white border border-stone-200 dark:bg-stone-850 dark:border-stone-800 dark:text-stone-300 rounded hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer"
                          >
                            {img.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {t('description')} <span className="text-rose-500">*</span>
                    </label>
                    <Textarea
                      required
                      rows={4}
                      value={formData.description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                      placeholder="Enter deep Vedic description of benefits, sourcing and handcrafting parameters..."
                      className="text-xs bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl resize-none"
                    />
                    {errors.description && (
                      <span className="text-[10px] text-rose-600 font-semibold">{errors.description}</span>
                    )}
                  </div>

                  {/* Checkbox configs (Featured, Discount, Status) */}
                  <div className="border-t border-stone-150 dark:border-stone-800/80 pt-4 mt-1 flex flex-col gap-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Featured */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked: boolean) => handleInputChange('featured', !!checked)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="featured" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                          {t('featured')}
                        </label>
                      </div>

                      {/* On Sale */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isSale"
                          checked={formData.isSale}
                          onCheckedChange={(checked: boolean) => handleInputChange('isSale', !!checked)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="isSale" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                          {t('isSale')}
                        </label>
                      </div>
                    </div>

                    {/* Status radio selection */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {t('status')}
                      </label>
                      <div className="flex items-center gap-4 mt-0.5">
                        {['active', 'draft', 'archived'].map(st => (
                          <label key={st} className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 capitalize cursor-pointer select-none">
                            <input
                              type="radio"
                              name="status"
                              value={st}
                              checked={formData.status === st}
                              onChange={() => handleInputChange('status', st)}
                              className="text-stone-900 focus:ring-0"
                            />
                            <span>{t(st)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </form>
              )}
            </div>

            {/* Footer triggers */}
            {!saveSuccess && (
              <div className="p-4 border-t border-stone-200 dark:border-stone-850 flex items-center justify-end gap-2 bg-white dark:bg-stone-900">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-9 px-4 text-xs rounded-xl"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSubmitForm}
                  disabled={isSubmitting}
                  size="sm"
                  className="h-9 px-5 text-xs bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="mr-2 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : null}
                  <span>{t('saveBtn')}</span>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
