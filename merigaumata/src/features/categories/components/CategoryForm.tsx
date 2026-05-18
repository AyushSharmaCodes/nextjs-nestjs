"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Languages, 
  FileText, 
  Image as ImageIcon, 
  Sliders, 
  Search, 
  Info,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Category, CategoryType, BaseCategory, LocalizedContent } from '../types';
import { MediaSection, ICON_POOL } from './MediaSection';
import { SEOSection } from './SEOSection';
import clsx from 'clsx';
import { useRouter } from '@/i18n/navigation';

interface CategoryFormProps {
  categoryType: CategoryType;
  initialData?: Category | null;
  allCategories: Category[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({
  categoryType,
  initialData,
  allCategories,
  onSave,
  onCancel
}: CategoryFormProps) {
  const router = useRouter();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'advanced' | 'seo'>('general');
  const [activeLocale, setActiveLocale] = useState<'en' | 'hi' | 'ta' | 'te'>('en');

  // Form Fields State
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [parentId, setParentId] = useState<string | null>(initialData?.parentId || null);
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [icon, setIcon] = useState(initialData?.icon || 'Milk');
  const [image, setImage] = useState(initialData?.image || '');
  const [bannerImage, setBannerImage] = useState(initialData?.bannerImage || '');
  
  // Localized Translations State
  const [translations, setTranslations] = useState<Record<string, LocalizedContent>>({
    en: { name: '', description: '', ...initialData?.translations?.en },
    hi: { name: '', description: '', ...initialData?.translations?.hi },
    ta: { name: '', description: '', ...initialData?.translations?.ta },
    te: { name: '', description: '', ...initialData?.translations?.te }
  });

  // SEO State
  const [seoTitle, setSeoTitle] = useState(initialData?.seo?.title || '');
  const [seoDesc, setSeoDesc] = useState(initialData?.seo?.description || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seo?.keywords || '');
  const [ogImage, setOgImage] = useState(initialData?.seo?.ogImage || '');

  // TYPE SPECIFIC FIELDS
  // 1. Products
  const [featured, setFeatured] = useState<boolean>(initialData?.type === 'product' ? initialData.featured : false);
  const [commissionRate, setCommissionRate] = useState<number>(initialData?.type === 'product' ? initialData.commissionRate : 5);
  const [taxRate, setTaxRate] = useState<number>(initialData?.type === 'product' ? initialData.taxRate : 5);
  const [productTags, setProductTags] = useState<string>(initialData?.type === 'product' ? initialData.tags.join(', ') : '');
  const [inventoryBehavior, setInventoryBehavior] = useState<'track' | 'ignore' | 'preorder'>(
    initialData?.type === 'product' ? initialData.inventoryBehavior : 'track'
  );

  // 2. Events
  const [eventType, setEventType] = useState<'conference' | 'webinar' | 'satsang' | 'festival' | 'workshop'>(
    initialData?.type === 'event' ? initialData.eventType : 'satsang'
  );
  const [categoryColor, setCategoryColor] = useState<string>(
    initialData?.type === 'event' ? initialData.categoryColor : '#D97706'
  );
  const [audienceType, setAudienceType] = useState<'all' | 'professionals' | 'kids' | 'seniors'>(
    initialData?.type === 'event' ? initialData.audienceType : 'all'
  );
  const [setupType, setSetupType] = useState<'online' | 'in-person' | 'hybrid'>(
    initialData?.type === 'event' ? initialData.setupType : 'hybrid'
  );
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(
    initialData?.type === 'event' ? initialData.recurrence : 'none'
  );

  // 3. Blogs
  const [blogFeatured, setBlogFeatured] = useState<boolean>(initialData?.type === 'blog' ? initialData.featured : false);
  const [editorNotes, setEditorNotes] = useState<string>(initialData?.type === 'blog' ? initialData.editorNotes || '' : '');
  const [autoPublish, setAutoPublish] = useState<boolean>(
    initialData?.type === 'blog' ? initialData.publishingSettings.autoPublish : true
  );
  const [requiresApproval, setRequiresApproval] = useState<boolean>(
    initialData?.type === 'blog' ? initialData.publishingSettings.requiresApproval : false
  );

  // 4. FAQs
  const [supportGrouping, setSupportGrouping] = useState<string>(
    initialData?.type === 'faq' ? initialData.supportGrouping : 'General'
  );
  const [faqAudience, setFaqAudience] = useState<'all' | 'registered' | 'premium'>(
    initialData?.type === 'faq' ? initialData.audienceType : 'all'
  );
  const [collapsible, setCollapsible] = useState<boolean>(initialData?.type === 'faq' ? initialData.collapsible : true);

  // Form Meta State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autosaveTime, setAutosaveTime] = useState<string | null>(null);
  
  // Handle slug auto-generation from English name if slug is untouched
  const slugTouched = useRef(!!initialData?.slug);
  
  const handleNameChange = (val: string) => {
    updateLocaleField('name', val);
    setIsDirty(true);
    if (!slugTouched.current && activeLocale === 'en') {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const updateLocaleField = (field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value
      }
    }));
  };

  // Setup simulated autosave loop every 30 seconds if dirty
  useEffect(() => {
    if (!isDirty) return;

    const interval = setInterval(() => {
      setAutosaveTime(new Date().toLocaleTimeString());
    }, 15000);

    return () => clearInterval(interval);
  }, [isDirty]);

  // Alert before unloading tab if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to discard them?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Exclude current category and its descendants from Parent selector to avoid infinite reference cycles
  const getEligibleParents = () => {
    if (!initialData) return allCategories.filter(c => c.type === categoryType);
    
    const decendantsIds = new Set<string>();
    const findDecendants = (parentId: string) => {
      allCategories.forEach(c => {
        if (c.parentId === parentId) {
          decendantsIds.add(c.id);
          findDecendants(c.id);
        }
      });
    };
    findDecendants(initialData.id);
    
    return allCategories.filter(c => 
      c.type === categoryType && 
      c.id !== initialData.id && 
      !decendantsIds.has(c.id)
    );
  };

  // Real-time validations
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!translations.en?.name?.trim()) {
      newErrors.nameEn = 'English Category Name is strictly required.';
    }
    if (!slug?.trim()) {
      newErrors.slug = 'URL slug cannot be empty.';
    } else if (!/^[a-z0-9-_]+$/.test(slug)) {
      newErrors.slug = 'Slug must only contain lowercase alphanumeric values, dashes or underscores.';
    }

    if (categoryType === 'product') {
      if (commissionRate < 0 || commissionRate > 100) {
        newErrors.commission = 'Commission rate must be between 0% and 100%.';
      }
      if (taxRate < 0 || taxRate > 100) {
        newErrors.tax = 'Tax rate must be between 0% and 100%.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setActiveTab('general');
      return;
    }

    setIsSaving(true);
    
    // Compile clean structures for saving
    const baseData = {
      parentId,
      slug,
      type: categoryType,
      isActive,
      icon,
      image,
      bannerImage,
      translations,
      seo: {
        title: seoTitle,
        description: seoDesc,
        keywords: seoKeywords,
        ogImage: image || ogImage
      }
    };

    let finalData = {};
    if (categoryType === 'product') {
      finalData = {
        ...baseData,
        featured,
        commissionRate,
        taxRate,
        tags: productTags.split(',').map(t => t.trim()).filter(Boolean),
        attributes: ['Size', 'Color'],
        variants: [
          { name: 'Packaging', options: ['Premium Pack', 'Sachet'] }
        ],
        inventoryBehavior
      };
    } else if (categoryType === 'event') {
      finalData = {
        ...baseData,
        eventType,
        categoryColor,
        audienceType,
        setupType,
        recurrence
      };
    } else if (categoryType === 'blog') {
      finalData = {
        ...baseData,
        featured: blogFeatured,
        editorNotes,
        publishingSettings: { autoPublish, requiresApproval }
      };
    } else if (categoryType === 'faq') {
      finalData = {
        ...baseData,
        supportGrouping,
        audienceType: faqAudience,
        collapsible
      };
    }

    try {
      await onSave(finalData);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to verify language completeness
  const getLanguageProgressBadge = (lang: 'en' | 'hi' | 'ta' | 'te') => {
    const hasName = !!translations[lang]?.name?.trim();
    const hasDesc = !!translations[lang]?.description?.trim();
    if (hasName && hasDesc) {
      return <span className="h-2 w-2 rounded-full bg-green-500" title="100% complete"></span>;
    }
    if (hasName) {
      return <span className="h-2 w-2 rounded-full bg-amber-400" title="Partially complete"></span>;
    }
    return <span className="h-2 w-2 rounded-full bg-earth-300" title="Not translated"></span>;
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-earth-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-foreground">
              {initialData ? `Modify ${initialData.translations.en?.name}` : `Establish new ${categoryType} Node`}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground/50">
              <span className="font-mono">Locale: {activeLocale.toUpperCase()}</span>
              {autosaveTime && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  • <CheckCircle className="h-3 w-3" /> Auto-saved draft: {autosaveTime}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-earth-200 text-foreground/75 hover:bg-earth-100 hover:text-foreground rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Filing Node...' : 'Save Category'}
          </button>
        </div>
      </div>

      {/* Warning dirty notification */}
      {isDirty && !autosaveTime && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs animate-pulse">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          You have unsaved form states. Standard client validations are active.
        </div>
      )}

      {/* Layout Grid: Left Form Tabs, Right Preview summary card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Tabs Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-earth-200 gap-1 bg-card rounded-2xl p-1 border">
            {[
              { id: 'general', label: '1. General Info', icon: FileText },
              { id: 'media', label: '2. Media Assets', icon: ImageIcon },
              { id: 'advanced', label: '3. Specialized Fields', icon: Sliders },
              { id: 'seo', label: '4. SEO Socials', icon: Sparkles }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all",
                    activeTab === tab.id 
                      ? "bg-earth-100 text-primary-600 font-bold" 
                      : "text-foreground/50 hover:text-foreground hover:bg-earth-50"
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT: 1. GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
              
              {/* Locale Translations Tabs switcher */}
              <div className="bg-earth-50 rounded-2xl p-4 border border-earth-200">
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-primary-500" />
                  Translation namespaces catalog (Intl)
                </label>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'Hindi (हिंदी)' },
                    { code: 'ta', label: 'Tamil (தமிழ்)' },
                    { code: 'te', label: 'Telugu (తెలుగు)' }
                  ].map(locale => (
                    <button
                      key={locale.code}
                      type="button"
                      onClick={() => setActiveLocale(locale.code as any)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all",
                        activeLocale === locale.code 
                          ? "bg-card border-primary-500 text-primary-600 shadow-sm" 
                          : "bg-background border-earth-200 text-foreground/60 hover:bg-earth-100/50"
                      )}
                    >
                      {getLanguageProgressBadge(locale.code as any)}
                      {locale.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Localized Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 flex justify-between">
                  <span>Category Title ({activeLocale.toUpperCase()})*</span>
                  {activeLocale !== 'en' && <span className="text-[10px] text-foreground/40 font-semibold font-mono">EN Reference: "{translations.en?.name || 'Empty'}"</span>}
                </label>
                <input
                  type="text"
                  placeholder={`Category Name in ${activeLocale === 'en' ? 'English' : activeLocale.toUpperCase()}...`}
                  value={translations[activeLocale]?.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={clsx(
                    "w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-background text-sm transition-all",
                    errors.nameEn && activeLocale === 'en' ? "border-red-500 focus:border-red-500" : "border-earth-200 focus:border-primary-500"
                  )}
                />
                {errors.nameEn && activeLocale === 'en' && (
                  <p className="text-red-500 text-[10px] font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {errors.nameEn}
                  </p>
                )}
              </div>

              {/* Localized Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                  Category Story & Description ({activeLocale.toUpperCase()})
                </label>
                <textarea
                  rows={4}
                  placeholder={`Write category insights in ${activeLocale === 'en' ? 'English' : activeLocale.toUpperCase()}...`}
                  value={translations[activeLocale]?.description || ''}
                  onChange={(e) => { updateLocaleField('description', e.target.value); setIsDirty(true); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-background text-sm transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-earth-100">
                {/* Custom URL Slug */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 flex justify-between">
                    <span>URL Path Slug (Canonical)*</span>
                    <span className="text-[10px] text-foreground/40 font-mono">auto-generates</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-')); slugTouched.current = true; setIsDirty(true); }}
                    className={clsx(
                      "w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-background text-sm font-mono transition-all",
                      errors.slug ? "border-red-500 focus:border-red-500" : "border-earth-200 focus:border-primary-500"
                    )}
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-[10px] font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {errors.slug}
                    </p>
                  )}
                </div>

                {/* Parent category selection */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                    Parent Hierarchy Placement
                  </label>
                  <select
                    value={parentId || ''}
                    onChange={(e) => { setParentId(e.target.value || null); setIsDirty(true); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-background text-sm transition-all"
                  >
                    <option value="">None (Root Category Level)</option>
                    {getEligibleParents().map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.translations.en?.name || 'Untitled category'} (/{parent.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status togglers */}
              <div className="flex items-center justify-between p-4 bg-earth-50 rounded-2xl border border-earth-200 mt-6">
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <Eye className="h-5 w-5 text-secondary-600 animate-pulse" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-foreground/45" />
                  )}
                  <div>
                    <h5 className="text-xs font-semibold text-foreground">Operational Visibility Status</h5>
                    <p className="text-[10px] text-foreground/40 mt-0.5">Toggle to instantly activate or draft this catalog category node.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsActive(!isActive); setIsDirty(true); }}
                  className={clsx(
                    "w-12 h-6.5 rounded-full relative transition-colors duration-200 ease-in-out border border-earth-200",
                    isActive ? "bg-secondary-500" : "bg-earth-300"
                  )}
                >
                  <span 
                    className={clsx(
                      "absolute top-0.5 left-0.5 bg-card w-5.5 h-5.5 rounded-full shadow-md transition-transform duration-200 ease-in-out",
                      isActive ? "transform translate-x-5.5" : ""
                    )}
                  />
                </button>
              </div>

            </div>
          )}

          {/* TAB CONTENT: 2. MEDIA ASSETS */}
          {activeTab === 'media' && (
            <MediaSection 
              icon={icon} 
              onChangeIcon={(val) => { setIcon(val); setIsDirty(true); }} 
              image={image} 
              onChangeImage={(val) => { setImage(val); setIsDirty(true); }}
              bannerImage={bannerImage}
              onChangeBannerImage={(val) => { setBannerImage(val); setIsDirty(true); }}
              categoryType={categoryType}
            />
          )}

          {/* TAB CONTENT: 3. ADVANCED FIELD SPECIALIZATION */}
          {activeTab === 'advanced' && (
            <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in text-left">
              
              <h4 className="text-sm font-serif font-semibold text-foreground border-b border-earth-100 pb-3 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary-500" />
                Specialized Node Schema for <span className="capitalize text-primary-600"> {categoryType} Categories</span>
              </h4>

              {/* PRODUCT SPECIFIC CONTROLS */}
              {categoryType === 'product' && (
                <div className="space-y-6">
                  
                  {/* Featured & tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Featured Category */}
                    <div className="flex items-center justify-between p-4 bg-earth-50 rounded-2xl border border-earth-200">
                      <div>
                        <h5 className="text-xs font-semibold text-foreground">Featured E-commerce Hook</h5>
                        <p className="text-[10px] text-foreground/40 mt-0.5">Prioritize on main homepage carousel banners.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFeatured(!featured); setIsDirty(true); }}
                        className={clsx(
                          "w-12 h-6.5 rounded-full relative transition-colors duration-200 ease-in-out border border-earth-200",
                          featured ? "bg-primary-500" : "bg-earth-300"
                        )}
                      >
                        <span 
                          className={clsx(
                            "absolute top-0.5 left-0.5 bg-card w-5.5 h-5.5 rounded-full shadow-md transition-transform duration-200 ease-in-out",
                            featured ? "transform translate-x-5.5" : ""
                          )}
                        />
                      </button>
                    </div>

                    {/* Inventory Behavior */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                        Inventory Purchase Rules
                      </label>
                      <select
                        value={inventoryBehavior}
                        onChange={(e) => { setInventoryBehavior(e.target.value as any); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-xs transition-all"
                      >
                        <option value="track">Track Inventory & Stop Sales on Stockout</option>
                        <option value="ignore">Ignore Tracking (Always available)</option>
                        <option value="preorder">Pre-order Support (Backordered allowed)</option>
                      </select>
                    </div>
                  </div>

                  {/* Financial commission settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-earth-100">
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5 flex justify-between">
                        <span>Vendor Commission Rate (%)</span>
                        {errors.commission && <span className="text-red-500 text-[10px] font-bold">{errors.commission}</span>}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={commissionRate}
                        onChange={(e) => { setCommissionRate(parseFloat(e.target.value) || 0); setIsDirty(true); }}
                        className="w-full px-4 py-2 rounded-xl border border-earth-200 bg-background text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5 flex justify-between">
                        <span>Standard Category GST Tax Rate (%)</span>
                        {errors.tax && <span className="text-red-500 text-[10px] font-bold">{errors.tax}</span>}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => { setTaxRate(parseFloat(e.target.value) || 0); setIsDirty(true); }}
                        className="w-full px-4 py-2 rounded-xl border border-earth-200 bg-background text-sm"
                      />
                    </div>
                  </div>

                  {/* Attribute Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                      Operational Search Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. organic, pure a2, ghee, cow urine"
                      value={productTags}
                      onChange={(e) => { setProductTags(e.target.value); setIsDirty(true); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                </div>
              )}

              {/* EVENT SPECIFIC CONTROLS */}
              {categoryType === 'event' && (
                <div className="space-y-6">
                  
                  {/* Event Type and Color */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Event Type Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                        Specific Event Structure
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => { setEventType(e.target.value as any); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-xs transition-all"
                      >
                        <option value="satsang">Satsang & Vedic Discourses</option>
                        <option value="festival">Festival Ceremonies</option>
                        <option value="workshop">Goshala Workshops / Seva</option>
                        <option value="conference">National Cows Protection Summit</option>
                        <option value="webinar">Online Webinar Stream</option>
                      </select>
                    </div>

                    {/* Category Color Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5 flex justify-between">
                        <span>Category Badge Color Code</span>
                        <span className="font-mono text-[10px] text-foreground/50">{categoryColor}</span>
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={categoryColor}
                          onChange={(e) => { setCategoryColor(e.target.value); setIsDirty(true); }}
                          className="h-10 w-12 rounded-lg border border-earth-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {['#D97706', '#16A34A', '#2563EB', '#DC2626', '#7C3AED'].map(color => (
                            <button
                              type="button"
                              key={color}
                              onClick={() => { setCategoryColor(color); setIsDirty(true); }}
                              className="h-6 w-6 rounded-full border border-white shadow-sm transition-transform hover:scale-110"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Audience & online parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-earth-100">
                    
                    {/* Audience type */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                        Focus Audience Target
                      </label>
                      <select
                        value={audienceType}
                        onChange={(e) => { setAudienceType(e.target.value as any); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-xs"
                      >
                        <option value="all">General Public (All Ages)</option>
                        <option value="professionals">Scholars & Professionals</option>
                        <option value="kids">Children & Youth Seva</option>
                        <option value="seniors">Seniors Satsang Circle</option>
                      </select>
                    </div>

                    {/* Location setup */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                        Venue Venue Setup
                      </label>
                      <select
                        value={setupType}
                        onChange={(e) => { setSetupType(e.target.value as any); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-xs"
                      >
                        <option value="hybrid">Hybrid (Both Online & On-site)</option>
                        <option value="in-person">In-Person Only (At Goshala)</option>
                        <option value="online">Purely Online Stream</option>
                      </select>
                    </div>

                    {/* Recurrence support */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                        Event Schedule Recurrence
                      </label>
                      <select
                        value={recurrence}
                        onChange={(e) => { setRecurrence(e.target.value as any); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-xs"
                      >
                        <option value="none">One-Time Special Gathering</option>
                        <option value="daily">Daily Cows Feeding & Prayer</option>
                        <option value="weekly">Weekly Sabbath Satsangs</option>
                        <option value="monthly">Monthly Purifying Havans</option>
                      </select>
                    </div>

                  </div>

                </div>
              )}

              {/* BLOG / CMS SPECIFIC CONTROLS */}
              {categoryType === 'blog' && (
                <div className="space-y-6">
                  
                  {/* Featured Blog banner */}
                  <div className="flex items-center justify-between p-4 bg-earth-50 rounded-2xl border border-earth-200">
                    <div>
                      <h5 className="text-xs font-semibold text-foreground">CMS Priority Carousel Feature</h5>
                      <p className="text-[10px] text-foreground/40 mt-0.5">Check to display as a top category tag on storefront articles header.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setBlogFeatured(!blogFeatured); setIsDirty(true); }}
                      className={clsx(
                        "w-12 h-6.5 rounded-full relative transition-colors duration-200 ease-in-out border border-earth-200",
                        blogFeatured ? "bg-primary-500" : "bg-earth-300"
                      )}
                    >
                      <span 
                        className={clsx(
                          "absolute top-0.5 left-0.5 bg-card w-5.5 h-5.5 rounded-full shadow-md transition-transform duration-200 ease-in-out",
                          blogFeatured ? "transform translate-x-5.5" : ""
                        )}
                      />
                    </button>
                  </div>

                  {/* Publishing workflow rules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-earth-100">
                    
                    {/* Auto-publish */}
                    <div className="flex items-center justify-between p-4 bg-earth-50 rounded-2xl border border-earth-200">
                      <div>
                        <h5 className="text-xs font-semibold text-foreground">Auto-Publish Submissions</h5>
                        <p className="text-[10px] text-foreground/40 mt-0.5">Instantly publish approved authors' articles.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setAutoPublish(!autoPublish); setIsDirty(true); }}
                        className={clsx(
                          "w-12 h-6.5 rounded-full relative transition-colors duration-200 ease-in-out border border-earth-200",
                          autoPublish ? "bg-secondary-500" : "bg-earth-300"
                        )}
                      >
                        <span 
                          className={clsx(
                            "absolute top-0.5 left-0.5 bg-card w-5.5 h-5.5 rounded-full shadow-md transition-transform duration-200 ease-in-out",
                            autoPublish ? "transform translate-x-5.5" : ""
                          )}
                        />
                      </button>
                    </div>

                    {/* Requires Approval */}
                    <div className="flex items-center justify-between p-4 bg-earth-50 rounded-2xl border border-earth-200">
                      <div>
                        <h5 className="text-xs font-semibold text-foreground">Peer Editorial Review Gate</h5>
                        <p className="text-[10px] text-foreground/40 mt-0.5">Force editorial approval board signoff.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setRequiresApproval(!requiresApproval); setIsDirty(true); }}
                        className={clsx(
                          "w-12 h-6.5 rounded-full relative transition-colors duration-200 ease-in-out border border-earth-200",
                          requiresApproval ? "bg-amber-500" : "bg-earth-300"
                        )}
                      >
                        <span 
                          className={clsx(
                            "absolute top-0.5 left-0.5 bg-card w-5.5 h-5.5 rounded-full shadow-md transition-transform duration-200 ease-in-out",
                            requiresApproval ? "transform translate-x-5.5" : ""
                          )}
                        />
                      </button>
                    </div>

                  </div>

                  {/* Internal editor notes */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                      CMS Editorial Staff Guidelines & Notes (Internal)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Ensure all blogs placed here reference authorized ayurvedic texts..."
                      value={editorNotes}
                      onChange={(e) => { setEditorNotes(e.target.value); setIsDirty(true); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-sm focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>

                </div>
              )}

              {/* FAQ / HELP CENTER SPECIFIC CONTROLS */}
              {categoryType === 'faq' && (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Support Grouping */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                        Help Center Support Grouping
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sponsorship, Cow Care, Logistics"
                        value={supportGrouping}
                        onChange={(e) => { setSupportGrouping(e.target.value); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    {/* FAQ Collapsible */}
                    <div className="flex items-center justify-between p-4 bg-earth-50 rounded-2xl border border-earth-200">
                      <div>
                        <h5 className="text-xs font-semibold text-foreground">Accordion Expansion Default</h5>
                        <p className="text-[10px] text-foreground/40 mt-0.5">Render as expandable drawers on FAQs index.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCollapsible(!collapsible); setIsDirty(true); }}
                        className={clsx(
                          "w-12 h-6.5 rounded-full relative transition-colors duration-200 ease-in-out border border-earth-200",
                          collapsible ? "bg-primary-500" : "bg-earth-300"
                        )}
                      >
                        <span 
                          className={clsx(
                            "absolute top-0.5 left-0.5 bg-card w-5.5 h-5.5 rounded-full shadow-md transition-transform duration-200 ease-in-out",
                            collapsible ? "transform translate-x-5.5" : ""
                          )}
                        />
                      </button>
                    </div>

                  </div>

                  {/* FAQ permissions audience */}
                  <div className="pt-4 border-t border-earth-100">
                    <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                      Viewing Security Access Permissions
                    </label>
                    <select
                      value={faqAudience}
                      onChange={(e) => { setFaqAudience(e.target.value as any); setIsDirty(true); }}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-200 bg-background text-xs"
                    >
                      <option value="all">Anonymous (Visible to Guest Public)</option>
                      <option value="registered">Registered Members Only (Signed in)</option>
                      <option value="premium">Premium Sponsors Only (Adopter Tier)</option>
                    </select>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB CONTENT: 4. SEO SOCIAL PREVIEW PANEL */}
          {activeTab === 'seo' && (
            <SEOSection
              seoTitle={seoTitle}
              onChangeSeoTitle={(val) => { setSeoTitle(val); setOgImage(image); setIsDirty(true); }}
              seoDesc={seoDesc}
              onChangeSeoDesc={(val) => { setSeoDesc(val); setIsDirty(true); }}
              seoKeywords={seoKeywords}
              onChangeSeoKeywords={(val) => { setSeoKeywords(val); setIsDirty(true); }}
              categorySlug={slug}
              categoryName={translations[activeLocale]?.name || 'Category'}
              categoryDescription={translations[activeLocale]?.description || ''}
              previewImage={image}
            />
          )}

        </div>

        {/* Right Side: Floating High-fidelity Card Preview */}
        <div className="space-y-6">
          <div className="sticky top-6 bg-card border border-earth-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h4 className="text-sm font-serif font-bold text-foreground border-b border-earth-100 pb-3 flex items-center gap-1.5">
              <Eye className="h-4.5 w-4.5 text-primary-500" />
              Live Visual Catalog Card
            </h4>

            {/* Simulated Live visual Category badge wrapper */}
            <div className="bg-earth-50 rounded-2xl p-5 border border-earth-200 relative overflow-hidden group shadow-inner">
              
              {/* Category accent background design color (Events only) */}
              {categoryType === 'event' && (
                <div 
                  className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-2xl opacity-30 transition-opacity" 
                  style={{ backgroundColor: categoryColor }}
                />
              )}

              {/* Cover cover banner preview */}
              <div className="aspect-video bg-earth-200 rounded-xl overflow-hidden mb-4 relative shadow-sm border border-earth-100/50">
                {bannerImage || image ? (
                  <img 
                    src={bannerImage || image} 
                    alt="Category Live Card Cover" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-foreground/20 font-mono text-[10px]">
                    <ImageIcon className="h-8 w-8 mb-1 opacity-40 animate-pulse" />
                    Pending image upload
                  </div>
                )}
                
                {/* Visual Category Label Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-bold text-white tracking-widest uppercase flex items-center gap-1">
                  <span>{categoryType}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-card rounded-lg border border-earth-200/80 flex items-center justify-center text-primary-600 shadow-sm">
                    {React.createElement(
                      (ICON_POOL.find((i: any) => i.name === icon)?.icon) || Sliders, 
                      { className: "h-4.5 w-4.5" }
                    )}
                  </div>
                  <h4 className="font-serif font-semibold text-foreground text-sm truncate flex-1">
                    {translations[activeLocale]?.name || 'Untitled Category'}
                  </h4>
                </div>

                <p className="text-xs text-foreground/50 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {translations[activeLocale]?.description || 'Fill general category information to preview metadata descriptors.'}
                </p>

                {/* Sub specifications badges */}
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-earth-200/50 text-[10px]">
                  
                  {/* Products tags preview */}
                  {categoryType === 'product' && (
                    <>
                      <span className="px-2 py-0.5 bg-earth-200/60 rounded-md font-mono font-medium">GST: {taxRate}%</span>
                      {featured && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold uppercase text-[9px]">Featured</span>}
                    </>
                  )}

                  {/* Event labels preview */}
                  {categoryType === 'event' && (
                    <>
                      <span 
                        className="px-2 py-0.5 text-white rounded-md font-bold uppercase text-[8px] tracking-wide"
                        style={{ backgroundColor: categoryColor }}
                      >
                        {eventType}
                      </span>
                      <span className="px-2 py-0.5 bg-earth-200/60 rounded-md capitalize font-medium">{setupType}</span>
                    </>
                  )}

                  {/* Blog cover */}
                  {categoryType === 'blog' && (
                    <>
                      {blogFeatured && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold uppercase text-[8px] tracking-wide">Featured Category</span>}
                      <span className="px-2 py-0.5 bg-earth-200/60 rounded-md font-medium text-[9px] uppercase tracking-wider">{autoPublish ? 'Auto-Pub' : 'Requires Sign-Off'}</span>
                    </>
                  )}

                  {/* FAQs grouping preview */}
                  {categoryType === 'faq' && (
                    <>
                      <span className="px-2 py-0.5 bg-earth-200/60 rounded-md font-medium font-mono text-[9px]">Scope: {supportGrouping}</span>
                      <span className="px-2 py-0.5 bg-earth-200/60 rounded-md capitalize font-medium">Group: {faqAudience}</span>
                    </>
                  )}

                </div>
              </div>

            </div>

            {/* Quick summary check list */}
            <div className="space-y-2.5 text-xs text-foreground/60 border-t border-earth-100 pt-4">
              <div className="font-semibold text-foreground mb-1 flex items-center gap-1">
                <Info className="h-4 w-4 text-primary-500" />
                Category Compilation Checklist
              </div>
              <div className="flex items-center justify-between">
                <span>1. Localized Translations (EN/HI)</span>
                {translations.en?.name && translations.hi?.name ? (
                  <span className="text-green-600 font-bold font-mono">OK</span>
                ) : (
                  <span className="text-amber-500 font-bold font-mono">PENDING</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>2. Media Assets uploaded</span>
                {image ? (
                  <span className="text-green-600 font-bold font-mono">OK</span>
                ) : (
                  <span className="text-foreground/30 font-mono">OPTIONAL</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>3. SEO Social Previews set</span>
                {seoTitle && seoDesc ? (
                  <span className="text-green-600 font-bold font-mono">OK</span>
                ) : (
                  <span className="text-amber-500 font-bold font-mono">AUTO</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </form>
  );
}
