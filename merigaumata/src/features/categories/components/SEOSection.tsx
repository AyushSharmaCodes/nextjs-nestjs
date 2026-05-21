"use client";

import React, { useState } from 'react';
import { AppIcon } from '@/shared/icons';
import clsx from 'clsx';

interface SEOSectionProps {
  seoTitle: string;
  onChangeSeoTitle: (val: string) => void;
  seoDesc: string;
  onChangeSeoDesc: (val: string) => void;
  seoKeywords: string;
  onChangeSeoKeywords: (val: string) => void;
  categorySlug: string;
  categoryName: string;
  categoryDescription: string;
  previewImage?: string;
}

export function SEOSection({
  seoTitle,
  onChangeSeoTitle,
  seoDesc,
  onChangeSeoDesc,
  seoKeywords,
  onChangeSeoKeywords,
  categorySlug,
  categoryName,
  categoryDescription,
  previewImage
}: SEOSectionProps) {
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSocialTab, setActiveSocialTab] = useState<'google' | 'facebook' | 'x'>('google');

  // Fallbacks for display
  const displayTitle = seoTitle || `${categoryName || 'Unnamed Category'} - Organic Wellness & Divine Teachings`;
  const displayDesc = seoDesc || categoryDescription || 'Discover pure organic elements, spiritual insights, traditional wisdom, and protected Cow Seva initiatives designed for holistic wellness.';
  const displaySlug = categorySlug || 'category-name';
  const displayImage = previewImage || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=60';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Fields */}
        <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-base font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
            <AppIcon name="sparkles" className="h-5 w-5 text-primary-500" />
            SEO & Indexing Metadata
          </h3>
          <p className="text-xs text-foreground/50">
            Fine-tune search engine visibility and click-through rates. These tags control appearance across crawlers and indices.
          </p>

          {/* Meta Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1.5 flex justify-between">
              <span>SEO Meta Title</span>
              <span className={clsx(
                "text-[10px] font-mono",
                displayTitle.length > 60 ? "text-amber-500 font-bold" : "text-foreground/40"
              )}>
                {displayTitle.length} / 60 chars (Recommended)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Pure A2 Cow Ghee churned from Gir Cows"
              value={seoTitle}
              onChange={(e) => onChangeSeoTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-background text-sm transition-all"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1.5 flex justify-between">
              <span>SEO Meta Description</span>
              <span className={clsx(
                "text-[10px] font-mono",
                displayDesc.length > 160 ? "text-amber-500 font-bold" : "text-foreground/40"
              )}>
                {displayDesc.length} / 160 chars (Recommended)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide a compelling summary that encourages users to click on search listings..."
              value={seoDesc}
              onChange={(e) => onChangeSeoDesc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-background text-sm transition-all resize-none"
            />
          </div>

          {/* Focus Keywords */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
              SEO Focus Keywords (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. bilona ghee, pure A2 milk, cows welfare"
              value={seoKeywords}
              onChange={(e) => onChangeSeoKeywords(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-background text-sm transition-all"
            />
          </div>

          <div className="bg-earth-50 rounded-2xl p-4 border border-earth-200">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AppIcon name="globe" className="h-4 w-4 text-primary-500" />
              Canonical & Social URL
            </h4>
            <div className="mt-2 text-xs font-mono text-foreground/50 truncate">
              https://merigaumata.org/categories/<span className="text-primary-600 font-semibold">{displaySlug}</span>
            </div>
          </div>
        </div>

        {/* Live Preview Compiler */}
        <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-earth-100 pb-4 mb-5">
            <h3 className="text-base font-serif font-semibold text-foreground flex items-center gap-2">
              <AppIcon name="eye" className="h-5 w-5 text-primary-500" />
              Dynamic Snippet Compiler
            </h3>
            
            {/* social selectors */}
            <div className="flex bg-earth-50 border border-earth-200 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setActiveSocialTab('google')}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-all",
                  activeSocialTab === 'google' 
                    ? "bg-card text-foreground shadow-sm font-semibold" 
                    : "text-foreground/50 hover:text-foreground"
                )}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => setActiveSocialTab('facebook')}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-all",
                  activeSocialTab === 'facebook' 
                    ? "bg-card text-foreground shadow-sm font-semibold" 
                    : "text-foreground/50 hover:text-foreground"
                )}
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => setActiveSocialTab('x')}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-all",
                  activeSocialTab === 'x' 
                    ? "bg-card text-foreground shadow-sm font-semibold" 
                    : "text-foreground/50 hover:text-foreground"
                )}
              >
                X / Twitter
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            
            {/* GOOGLE PREVIEW */}
            {activeSocialTab === 'google' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-foreground/40 font-semibold tracking-wider uppercase">SERP Engine Snippet</span>
                  <div className="flex bg-earth-50 border border-earth-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setGoogleDevice('desktop')}
                      className={clsx("p-1.5 rounded-md flex items-center justify-center", googleDevice === 'desktop' ? "bg-card text-primary-500 shadow-sm" : "text-foreground/40")}
                    >
                      <AppIcon name="laptop" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoogleDevice('mobile')}
                      className={clsx("p-1.5 rounded-md flex items-center justify-center", googleDevice === 'mobile' ? "bg-card text-primary-500 shadow-sm" : "text-foreground/40")}
                    >
                      <AppIcon name="smartphone" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div 
                  className={clsx(
                    "bg-card border border-earth-100 rounded-2xl p-5 shadow-sm space-y-1.5 font-sans mx-auto text-left",
                    googleDevice === 'mobile' ? "max-w-[360px] border-2 border-earth-300" : "w-full"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-[#202124] dark:text-[#bdc1c6] mb-1 truncate">
                    <div className="h-5 w-5 bg-earth-100 rounded-full flex items-center justify-center text-[10px] border border-earth-200">🪷</div>
                    <div className="truncate flex flex-col">
                      <span className="text-xs leading-tight font-medium">MeriGauMata Wellness</span>
                      <span className="text-[10px] text-foreground/40 leading-none">https://merigaumata.org › categories › {displaySlug}</span>
                    </div>
                  </div>
                  <h3 className="text-[19px] leading-tight text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium truncate max-w-full">
                    {displayTitle.slice(0, 70)}{displayTitle.length > 70 ? '...' : ''}
                  </h3>
                  <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed">
                    <span className="text-foreground/40 mr-1">May 18, 2026 —</span>
                    {displayDesc.slice(0, 155)}{displayDesc.length > 155 ? '...' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* FACEBOOK PREVIEW */}
            {activeSocialTab === 'facebook' && (
              <div className="bg-[#f0f2f5] dark:bg-earth-950 border border-earth-200 rounded-2xl overflow-hidden font-sans text-left max-w-[480px] mx-auto animate-fade-in shadow-sm">
                
                {/* Simulated Header */}
                <div className="flex items-center gap-2.5 p-3.5 bg-card">
                  <div className="h-9 w-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm">M</div>
                  <div>
                    <h5 className="text-[13px] font-semibold text-foreground leading-tight">MeriGauMata Organic Goshala</h5>
                    <span className="text-[11px] text-foreground/40 leading-none flex items-center gap-1">Sponsored · <AppIcon name="globe" className="h-3 w-3" /></span>
                  </div>
                </div>

                {/* Simulated post content */}
                <div className="px-3.5 pb-2.5 pt-0 bg-card text-xs text-foreground/80 leading-relaxed">
                  Pure joy from protected holy cows! Explore our certified {categoryName || 'new category'} line now. 🪷🐂
                </div>

                {/* Large Preview Image */}
                <div className="aspect-video relative overflow-hidden bg-earth-900 border-y border-earth-100">
                  <img 
                    src={displayImage} 
                    alt="Facebook OG Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Meta details footer */}
                <div className="p-3 bg-card border-t border-earth-100 space-y-0.5">
                  <div className="text-[11px] text-foreground/40 font-mono uppercase tracking-wider">MERIGAUMATA.ORG</div>
                  <h4 className="text-sm font-semibold text-foreground leading-tight truncate">{displayTitle}</h4>
                  <p className="text-xs text-foreground/50 leading-normal line-clamp-2">{displayDesc}</p>
                </div>
              </div>
            )}

            {/* X PREVIEW */}
            {activeSocialTab === 'x' && (
              <div className="border border-earth-200 rounded-2xl overflow-hidden font-sans text-left max-w-[460px] mx-auto animate-fade-in bg-card shadow-sm">
                
                {/* Large Cover */}
                <div className="aspect-[1.91/1] relative overflow-hidden bg-earth-900">
                  <img 
                    src={displayImage} 
                    alt="X Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Metadata */}
                <div className="p-3 border-t border-earth-100 bg-card space-y-0.5">
                  <div className="text-[11px] text-foreground/40 flex items-center gap-1">
                    <AppIcon name="globe" className="h-3 w-3" /> merigaumata.org
                  </div>
                  <h4 className="text-xs font-semibold text-foreground leading-snug truncate">{displayTitle}</h4>
                  <p className="text-[11px] text-foreground/50 leading-relaxed line-clamp-2">{displayDesc}</p>
                </div>
              </div>
            )}

          </div>

          <div className="mt-6 pt-4 border-t border-earth-100 flex items-center justify-between text-[10px] text-foreground/40">
            <span className="flex items-center gap-1">
              <AppIcon name="share" className="h-3.5 w-3.5 text-primary-500" />
              Previews update dynamically as you type values on the left.
            </span>
            <span className="font-mono">OG:image loaded</span>
          </div>
        </div>

      </div>
    </div>
  );
}
