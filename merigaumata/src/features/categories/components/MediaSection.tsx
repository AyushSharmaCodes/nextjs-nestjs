"use client";

import React, { useState } from 'react';
import { 
  UploadCloud, 
  Crop, 
  Trash2, 
  Sparkles, 
  Grid, 
  Check, 
  Milk, 
  Flame, 
  Leaf, 
  Compass, 
  Heart, 
  BookOpen, 
  Sprout, 
  HeartHandshake, 
  Truck, 
  HelpCircle,
  Maximize,
  Minimize,
  RefreshCw,
  Tag
} from 'lucide-react';
import clsx from 'clsx';

// Pre-curated list of beautiful category icons
export const ICON_POOL = [
  { name: 'Milk', icon: Milk },
  { name: 'Flame', icon: Flame },
  { name: 'Leaf', icon: Leaf },
  { name: 'Compass', icon: Compass },
  { name: 'Heart', icon: Heart },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Sprout', icon: Sprout },
  { name: 'HeartHandshake', icon: HeartHandshake },
  { name: 'Truck', icon: Truck },
  { name: 'HelpCircle', icon: HelpCircle },
  { name: 'Tag', icon: Tag }
];

interface MediaSectionProps {
  icon?: string;
  onChangeIcon: (iconName: string) => void;
  image?: string;
  onChangeImage: (imageUrl: string) => void;
  bannerImage?: string;
  onChangeBannerImage: (imageUrl: string) => void;
  categoryType: 'product' | 'event' | 'blog' | 'faq';
}

export function MediaSection({
  icon,
  onChangeIcon,
  image,
  onChangeImage,
  bannerImage,
  onChangeBannerImage,
  categoryType
}: MediaSectionProps) {
  const [selectedCropTarget, setSelectedCropTarget] = useState<'image' | 'banner' | null>(null);
  const [zoom, setZoom] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: -10, y: -20 });

  // Simulate file drops
  const handleSimulatedUpload = (target: 'image' | 'banner') => {
    const defaultImages = {
      image: {
        product: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&auto=format&fit=crop&q=80',
        event: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
        blog: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'
      }[categoryType],
      banner: {
        product: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
        event: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
        blog: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1200&auto=format&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1521791136368-1a8682707636?w=1200&auto=format&fit=crop&q=80'
      }[categoryType]
    };

    if (target === 'image') {
      onChangeImage(defaultImages.image);
    } else {
      onChangeBannerImage(defaultImages.banner);
    }
  };

  const startCropModal = (target: 'image' | 'banner') => {
    setSelectedCropTarget(target);
    setZoom(1.2);
    setRotation(0);
    setDragOffset({ x: -10, y: -20 });
  };

  const saveSimulatedCrop = () => {
    // Generate new mock URL indicating crop parameters applied
    const targetUrl = selectedCropTarget === 'image' ? image : bannerImage;
    if (targetUrl) {
      const croppedUrl = `${targetUrl}&cropped=true&zoom=${zoom}&rot=${rotation}&x=${dragOffset.x}&y=${dragOffset.y}`;
      if (selectedCropTarget === 'image') {
        onChangeImage(croppedUrl);
      } else {
        onChangeBannerImage(croppedUrl);
      }
    }
    setSelectedCropTarget(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Icon Library Selector */}
      <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-500" />
          Category Icon Identifier
        </h3>
        <p className="text-xs text-foreground/50 mb-4">
          Select a distinct, scalable glyph to identify this category across the storefront and admin charts.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-3">
          {ICON_POOL.map(item => {
            const IconComp = item.icon;
            const isSelected = icon === item.name;
            return (
              <button
                type="button"
                key={item.name}
                onClick={() => onChangeIcon(item.name)}
                className={clsx(
                  "h-12 flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 hover:scale-105 hover:shadow-sm",
                  isSelected 
                    ? "bg-primary-50 border-primary-500 text-primary-600 scale-105" 
                    : "bg-earth-50 border-earth-200 text-foreground/60 hover:bg-earth-100/50 hover:text-foreground"
                )}
              >
                <IconComp className={clsx("h-5 w-5", isSelected && "animate-bounce")} />
                <span className="text-[10px] mt-1 text-foreground/40 font-medium truncate max-w-full px-1">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Category Square Thumbnail */}
        <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
              <span>Thumbnail Image (1:1 Aspect Ratio)</span>
              {image && (
                <span className="inline-flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => startCropModal('image')}
                    className="p-1 text-foreground/40 hover:text-primary-600 rounded-lg hover:bg-earth-100 transition-colors"
                    title="Crop Image"
                  >
                    <Crop className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeImage('')}
                    className="p-1 text-foreground/40 hover:text-red-500 rounded-lg hover:bg-earth-100 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              )}
            </h4>
            <p className="text-xs text-foreground/50 mt-0.5">Highly visible on grids, product filters, and navigation links.</p>
          </div>

          {image ? (
            <div className="flex-1 flex items-center justify-center p-4 bg-earth-50 rounded-2xl border border-dashed border-earth-200 group relative overflow-hidden aspect-square max-h-64">
              <img 
                src={image} 
                alt="Category Thumbnail Preview" 
                className="w-full h-full object-cover rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => startCropModal('image')}
                  className="px-3.5 py-1.5 bg-white text-foreground rounded-xl text-xs font-semibold hover:bg-primary-500 hover:text-white transition-all shadow-md flex items-center gap-1.5"
                >
                  <Crop className="h-3.5 w-3.5" /> Adjust Crop
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => handleSimulatedUpload('image')}
              className="flex-1 flex flex-col items-center justify-center py-10 px-4 bg-earth-50 border-2 border-dashed border-earth-200 hover:border-primary-400 rounded-2xl cursor-pointer hover:bg-earth-100/50 transition-all duration-300 group aspect-square max-h-64 justify-self-center w-full"
            >
              <div className="h-12 w-12 bg-card rounded-2xl flex items-center justify-center border border-earth-200 shadow-sm mb-3 group-hover:scale-110 group-hover:bg-primary-50 transition-transform">
                <UploadCloud className="h-6 w-6 text-foreground/40 group-hover:text-primary-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">Click to upload image</p>
              <p className="text-xs text-foreground/40 mt-1">PNG, JPG, WEBP up to 5MB</p>
              <span className="text-[10px] mt-4 px-2 py-0.5 bg-earth-200 text-foreground/60 rounded-full font-mono">Simulator</span>
            </div>
          )}
        </div>

        {/* Category Banner Cover (16:9) */}
        {categoryType !== 'faq' && (
          <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Hero Banner Cover (16:9 Aspect Ratio)</span>
                {bannerImage && (
                  <span className="inline-flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startCropModal('banner')}
                      className="p-1 text-foreground/40 hover:text-primary-600 rounded-lg hover:bg-earth-100 transition-colors"
                      title="Crop Banner"
                    >
                      <Crop className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeBannerImage('')}
                      className="p-1 text-foreground/40 hover:text-red-500 rounded-lg hover:bg-earth-100 transition-colors"
                      title="Remove Banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </h4>
              <p className="text-xs text-foreground/50 mt-0.5">Displayed at the top of category landing pages.</p>
            </div>

            {bannerImage ? (
              <div className="flex-1 flex items-center justify-center bg-earth-50 rounded-2xl border border-dashed border-earth-200 group relative overflow-hidden aspect-video max-h-64">
                <img 
                  src={bannerImage} 
                  alt="Category Banner Preview" 
                  className="w-full h-full object-cover rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => startCropModal('banner')}
                    className="px-3.5 py-1.5 bg-white text-foreground rounded-xl text-xs font-semibold hover:bg-primary-500 hover:text-white transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Crop className="h-3.5 w-3.5" /> Adjust Crop
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => handleSimulatedUpload('banner')}
                className="flex-1 flex flex-col items-center justify-center py-10 px-4 bg-earth-50 border-2 border-dashed border-earth-200 hover:border-primary-400 rounded-2xl cursor-pointer hover:bg-earth-100/50 transition-all duration-300 group aspect-video max-h-64 justify-self-center w-full"
              >
                <div className="h-12 w-12 bg-card rounded-2xl flex items-center justify-center border border-earth-200 shadow-sm mb-3 group-hover:scale-110 group-hover:bg-primary-50 transition-transform">
                  <UploadCloud className="h-6 w-6 text-foreground/40 group-hover:text-primary-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">Click to upload banner</p>
                <p className="text-xs text-foreground/40 mt-1">Recommended width: 1200px</p>
                <span className="text-[10px] mt-4 px-2 py-0.5 bg-earth-200 text-foreground/60 rounded-full font-mono">Simulator</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fully Functional Simulated Cropping Dialog */}
      {selectedCropTarget && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-earth-200 shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="h-16 px-6 border-b border-earth-100/55 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                <Crop className="h-5 w-5 text-primary-500" />
                Edit Category Asset Framing
              </h3>
              <span className="text-xs font-semibold px-2 py-1 bg-primary-100 text-primary-700 rounded-lg">
                Aspect Ratio: {selectedCropTarget === 'image' ? '1:1 Square' : '16:9 Cinematic'}
              </span>
            </div>

            {/* Modal Canvas Box */}
            <div className="p-6 bg-earth-950 flex items-center justify-center relative min-h-[300px] overflow-hidden select-none">
              
              {/* Overlay cropping grids */}
              <div 
                className={clsx(
                  "border-2 border-primary-500 absolute z-10 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none transition-all duration-300",
                  selectedCropTarget === 'image' 
                    ? "w-[240px] h-[240px] rounded-xl" 
                    : "w-[400px] h-[225px] rounded-xl"
                )}
              >
                {/* 3x3 Grid Overlay Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-b border-white border-dashed"></div>
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-r border-b border-white border-dashed"></div>
                  <div className="border-b border-white border-dashed"></div>
                  <div className="border-r border-white border-dashed"></div>
                  <div className="border-r border-white border-dashed"></div>
                  <div></div>
                </div>
              </div>

              {/* Editable Crop Image */}
              <div 
                className="cursor-move absolute"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  left: `calc(50% + ${dragOffset.x}px)`,
                  top: `calc(50% + ${dragOffset.y}px)`,
                  width: selectedCropTarget === 'image' ? '280px' : '440px',
                  height: selectedCropTarget === 'image' ? '280px' : '248px',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out, left 0.1s ease-out, top 0.1s ease-out',
                  marginLeft: selectedCropTarget === 'image' ? '-140px' : '-220px',
                  marginTop: selectedCropTarget === 'image' ? '-140px' : '-124px',
                }}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  const startX = e.clientX - dragOffset.x;
                  const startY = e.clientY - dragOffset.y;
                  
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    setDragOffset({
                      x: moveEvent.clientX - startX,
                      y: moveEvent.clientY - startY
                    });
                  };
                  
                  const onMouseUp = () => {
                    setIsDragging(false);
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              >
                <img
                  src={selectedCropTarget === 'image' ? image : bannerImage}
                  alt="Crop Target"
                  className="w-full h-full object-cover pointer-events-none rounded-sm"
                />
              </div>
            </div>

            {/* Modal Controls */}
            <div className="p-6 bg-card border-t border-earth-100/50 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                
                {/* Zoom control */}
                <div className="flex items-center gap-2 w-full sm:w-1/2">
                  <Minimize className="h-4 w-4 text-foreground/40" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-primary-500 h-1 bg-earth-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <Maximize className="h-4 w-4 text-foreground/40" />
                  <span className="text-xs font-mono font-semibold text-foreground/60 w-10 text-right">{Math.round(zoom * 100)}%</span>
                </div>

                {/* Rotation control */}
                <div className="flex items-center gap-2 w-full sm:w-1/3">
                  <RefreshCw className="h-4 w-4 text-foreground/40" />
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="flex-1 accent-primary-500 h-1 bg-earth-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono font-semibold text-foreground/60 w-10 text-right">{rotation}°</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-earth-100 pt-4">
                <span className="text-[10px] text-foreground/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  Interact by dragging the canvas image above.
                </span>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCropTarget(null)}
                    className="px-4 py-2 border border-earth-200 text-foreground/75 hover:bg-earth-100 hover:text-foreground rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveSimulatedCrop}
                    className="px-5 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="h-4 w-4" /> Save Selection
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
