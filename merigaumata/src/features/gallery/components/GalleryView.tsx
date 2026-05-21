'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { AppIcon } from '@/shared/icons';
import { Pagination } from '@/shared/components/Pagination';
import { Gallery } from '../types/gallery.types';
import { useTranslations } from 'next-intl';

// Lazy load the heavy lightbox component strictly on the client side
const MediaLightbox = dynamic(() => import('./MediaLightbox'), {
  ssr: false,
});

interface GalleryViewProps {
  initialGalleries: Gallery[];
}

export function GalleryView({ initialGalleries }: GalleryViewProps) {
  const t = useTranslations('gallery');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [activeGalleryId, setActiveGalleryId] = useState<number | null>(null);

  const activeGallery = useMemo(() => {
    return initialGalleries.find(g => g.id === activeGalleryId);
  }, [activeGalleryId, initialGalleries]);

  const activeMediaUrl = useMemo(() => {
    return activeGallery && activeMediaIndex !== null ? activeGallery.images[activeMediaIndex] : null;
  }, [activeGallery, activeMediaIndex]);

  const isVideo = useMemo(() => {
    if (!activeMediaUrl) return false;
    return activeMediaUrl.includes('youtube.com') || activeMediaUrl.includes('youtu.be') || activeMediaUrl.includes('embed');
  }, [activeMediaUrl]);

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return 'https://picsum.photos/seed/video/600/400';
  };

  const handlePrev = useCallback(() => {
    if (activeGallery && activeMediaIndex !== null) {
      setActiveMediaIndex(prev => prev !== null ? (prev === 0 ? activeGallery.images.length - 1 : prev - 1) : null);
    }
  }, [activeGallery, activeMediaIndex]);

  const handleNext = useCallback(() => {
    if (activeGallery && activeMediaIndex !== null) {
      setActiveMediaIndex(prev => prev !== null ? (prev === activeGallery.images.length - 1 ? 0 : prev + 1) : null);
    }
  }, [activeGallery, activeMediaIndex]);

  const handleClose = useCallback(() => {
    setActiveGalleryId(null);
    setActiveMediaIndex(null);
  }, []);

  const itemsPerPage = viewMode === 'grid' ? 15 : 5;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGalleries = useMemo(() => {
    return initialGalleries.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, initialGalleries]);

  const totalPages = Math.ceil(filteredGalleries.length / itemsPerPage);
  
  const validPage = Math.max(1, Math.min(currentPage, totalPages));

  const currentGalleries = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return filteredGalleries.slice(start, start + itemsPerPage);
  }, [validPage, filteredGalleries, itemsPerPage]);

  const toggleFolder = (id: number) => {
    setExpandedFolderId(prev => prev === id ? null : id);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-4 mb-8 gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-primary-700 font-medium hover:text-primary-800 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
          >
            <span className="truncate max-w-[150px] sm:max-w-xs text-sm">{t('findFolders')}</span>
            <AppIcon name="chevronDown" className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                <AppIcon name="search" className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')} 
                  className="w-full text-sm outline-none border-none focus:ring-0 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredGalleries.length > 0 ? filteredGalleries.map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => { setExpandedFolderId(g.id); setIsDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md truncate block"
                  >
                    {g.title}
                  </button>
                )) : (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">{t('noFoldersFound')}</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex bg-gray-100 rounded-full p-1 border border-gray-200">
          <button 
            onClick={() => { setViewMode('grid'); setExpandedFolderId(null); }}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-tertiary-500 hover:text-tertiary-700'}`}
          >
            <AppIcon name="grid" className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setViewMode('list'); setExpandedFolderId(null); }}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-tertiary-500 hover:text-tertiary-700'}`}
          >
            <AppIcon name="list" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Folders Grids/Lists */}
      <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl'}`}>
        {currentGalleries.map((gallery) => {
          const img0 = gallery.images[0];
          const img1 = gallery.images[1];
          const img2 = gallery.images[2];
          const isExpanded = expandedFolderId === gallery.id;

          return (
            <div 
              key={gallery.id} 
              className={`group flex flex-col bg-white rounded-2xl shadow-sm border ${isExpanded ? 'border-primary-200/50 shadow-md ring-1 ring-primary-100 col-span-1 md:col-span-full p-6' : 'border-black/5 hover:border-black/10 hover:shadow-md p-4 cursor-pointer'} transition-all duration-300`}
              onClick={() => !isExpanded && toggleFolder(gallery.id)}
            >
              {/* Folder Header (always visible) */}
              <div className={`flex ${viewMode === 'grid' && !isExpanded ? 'flex-col' : 'flex-row'} items-stretch gap-6 relative`}>
                
                {/* Mosaic */}
                <div className={`grid grid-cols-2 gap-2 overflow-hidden bg-white ${isExpanded ? 'w-full sm:w-64 h-40 rounded-xl flex-shrink-0' : (viewMode === 'grid' ? 'mb-4 h-48 md:h-56 rounded-2xl shadow-sm border border-black/5' : 'w-48 h-32 rounded-xl flex-shrink-0')}`}>
                  <div className="relative w-full h-full">
                    {img0.includes('youtube') || img0.includes('youtu.be') || img0.includes('embed') ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={getYoutubeThumbnail(img0)} 
                          alt={gallery.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/35 transition-colors">
                          <AppIcon name="play" className="w-5 h-5 fill-white text-white opacity-85 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                    ) : (
                      <Image 
                        src={img0} 
                        alt={gallery.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="relative w-full h-full">
                      {img1.includes('youtube') || img1.includes('youtu.be') || img1.includes('embed') ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={getYoutubeThumbnail(img1)} 
                            alt={gallery.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500 delay-75"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/35 transition-colors">
                            <AppIcon name="play" className="w-4 h-4 fill-white text-white opacity-85 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      ) : (
                        <Image 
                          src={img1} 
                          alt={gallery.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500 delay-75"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="relative w-full h-full">
                      {img2.includes('youtube') || img2.includes('youtu.be') || img2.includes('embed') ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={getYoutubeThumbnail(img2)} 
                            alt={gallery.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500 delay-150"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/35 transition-colors">
                            <AppIcon name="play" className="w-4 h-4 fill-white text-white opacity-85 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      ) : (
                        <Image 
                          src={img2} 
                          alt={gallery.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500 delay-150"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Text info */}
                <div className={`flex flex-col justify-center py-2 flex-grow pr-10`}>
                  <h3 className={`font-bold text-tertiary-900 group-hover:text-primary-600 transition-colors ${viewMode === 'grid' && !isExpanded ? 'text-lg mt-0' : 'text-xl md:text-2xl mb-1'}`}>
                    {gallery.title}
                  </h3>
                  <p className={`text-tertiary-500 mt-1 ${isExpanded ? 'text-base' : 'text-sm'}`}>
                    {gallery.count}
                  </p>
                  {(!isExpanded && viewMode === 'list') && (
                    <p className="text-sm text-tertiary-400 mt-2 flex items-center gap-1 group-hover:text-primary-500 transition-colors">
                      <AppIcon name="folder" className="w-4 h-4" /> {t('clickToOpen')}
                    </p>
                  )}
                </div>

                {/* Toggle Indicator */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFolder(gallery.id); }}
                  className={`absolute ${isExpanded || viewMode === 'list' ? 'top-1/2 -translate-y-1/2 right-0' : 'bottom-0 right-0 top-auto translate-y-0'} w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm`}
                  aria-label={isExpanded ? 'Close folder' : 'Open folder'}
                >
                  <AppIcon name="chevronDown" className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {gallery.images.map((img, idx) => (
                      <div key={idx} className="relative h-48 md:h-56 rounded-xl overflow-hidden shadow-sm border border-black/5 bg-gray-50">
                        {img.includes('youtube') || img.includes('youtu.be') || img.includes('embed') ? (
                          <div 
                            onClick={(e) => { e.stopPropagation(); setActiveGalleryId(gallery.id); setActiveMediaIndex(idx); }}
                            className="group/item relative w-full h-full cursor-pointer overflow-hidden bg-black"
                          >
                            <Image 
                              src={getYoutubeThumbnail(img)} 
                              alt={`${gallery.title} video thumbnail`} 
                              fill
                              className="object-cover opacity-85 group-hover/item:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/40 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/30 group-hover/item:scale-110 group-hover/item:bg-white/40 transition-all duration-300 shadow-lg shadow-black/20">
                                <AppIcon name="play" className="w-5 h-5 fill-white ml-0.5" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={(e) => { e.stopPropagation(); setActiveGalleryId(gallery.id); setActiveMediaIndex(idx); }}
                            className="group/item relative w-full h-full cursor-pointer overflow-hidden"
                          >
                            <Image 
                              src={img} 
                              alt={`${gallery.title} - ${idx + 1}`} 
                              fill 
                              className="object-cover group-hover/item:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-all duration-300" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
        
        {currentGalleries.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            {t('noFoldersMatched')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination totalPages={totalPages} currentPage={validPage} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Lightbox / Media Viewport Overlay loaded dynamically */}
      {activeMediaUrl && activeMediaIndex !== null && activeGallery && (
        <MediaLightbox 
          activeMediaUrl={activeMediaUrl}
          activeGalleryTitle={activeGallery.title}
          activeMediaIndex={activeMediaIndex}
          totalImages={activeGallery.images.length}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
          isVideo={isVideo}
          itemCounterText={t('itemCounter', { index: activeMediaIndex + 1, total: activeGallery.images.length })}
        />
      )}
    </>
  );
}
