'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Pagination } from '@/shared/components/Pagination';
import { EventFiltersBar } from './EventFiltersBar';
import { useEventsQuery } from '../hooks/use-events';
import { Event } from '../types/events.types';
import { useTranslations, useLocale, useFormatter } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface EventsCatalogProps {
  initialEvents: Event[];
}

function formatDateTag(dateString: string, locale: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }).toLowerCase();
}

function getEventCategory(event: { title: string; description: string }) {
  const title = event.title.toLowerCase();
  const desc = event.description.toLowerCase();
  if (title.includes('art') || desc.includes('art') || title.includes('music') || desc.includes('music') || title.includes('reenactment') || desc.includes('reenactment')) return 'ART';
  if (title.includes('business') || desc.includes('business')) return 'BUSINESS';
  if (title.includes('retreat') || title.includes('yoga') || desc.includes('wellness') || title.includes('shakti') || title.includes('health') || title.includes('meditation')) return 'EDUCATION';
  if (title.includes('festival') || desc.includes('festival') || title.includes('celebration')) return 'FESTIVAL';
  if (title.includes('food') || desc.includes('food') || desc.includes('breakfast')) return 'FOOD';
  if (title.includes('nightlife')) return 'NIGHTLIFE';
  if (title.includes('sport') || title.includes('yoga')) return 'SPORTS';
  return 'MORE';
}

export function EventsCatalog({ initialEvents }: EventsCatalogProps) {
  const t = useTranslations('events');
  const locale = useLocale();
  const formatter = useFormatter();
  const searchParams = useSearchParams();

  const { data: queryEvents = [], isPending } = useEventsQuery();
  const allEvents = queryEvents.length > 0 ? queryEvents : initialEvents;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const searchVal = searchParams.get('search') || '';
  const categoryVal = searchParams.get('category') || '';
  const typeVal = searchParams.get('type') || '';
  const locationVal = searchParams.get('location') || '';
  const dateVal = searchParams.get('date') || '';

  // Classify events with categories
  const classifiedEvents = useMemo(() => {
    return allEvents.map(e => ({
      ...e,
      category: getEventCategory(e)
    }));
  }, [allEvents]);

  // Filter events dynamically
  const filteredEvents = useMemo(() => {
    let result = classifiedEvents;

    // 1. Search filter
    if (searchVal) {
      const q = searchVal.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) ||
        (e.subtitle && e.subtitle.toLowerCase().includes(q)) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    const activeCategory = categoryVal || typeVal;
    if (activeCategory && activeCategory.toUpperCase() !== 'ALL') {
      result = result.filter(e => 
        e.category.toUpperCase() === activeCategory.toUpperCase()
      );
    }

    // 3. Location filter
    if (locationVal) {
      result = result.filter(e => 
        e.location.toLowerCase() === locationVal.toLowerCase()
      );
    }

    // 4. Date filter
    if (dateVal) {
      const today = new Date();
      if (dateVal === 'upcoming') {
        result = result.filter(e => new Date(e.startDate) >= today);
      } else if (dateVal === 'past') {
        result = result.filter(e => new Date(e.startDate) < today);
      } else {
        result = result.filter(e => e.startDate.startsWith(dateVal));
      }
    }

    return result;
  }, [classifiedEvents, searchVal, categoryVal, typeVal, locationVal, dateVal]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(classifiedEvents.map(e => e.location))).sort();
  }, [classifiedEvents]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(classifiedEvents.map(e => e.category))).sort();
  }, [classifiedEvents]);

  const totalCount = filteredEvents.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const displayedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const activeCategory = categoryVal || typeVal;
  const currentActiveCategory = activeCategory.toUpperCase() || 'ALL';

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (searchVal) params.set('search', searchVal);
    if (dateVal) params.set('date', dateVal);
    if (locationVal) params.set('location', locationVal);
    if (typeVal) params.set('type', typeVal);
    
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    
    const str = params.toString();
    return `/events${str ? `?${str}` : ''}`;
  };

  if (isPending && allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
        <span className="text-sm font-medium">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="relative rounded-[2rem] mb-16 aspect-[16/9] md:aspect-[21/9]">
        <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
          <Image 
            src="https://picsum.photos/seed/vedicfestival/1920/1080" 
            alt="Festival" 
            fill 
            className="object-cover brightness-[0.85] dark:brightness-[0.7]"
            referrerPolicy="no-referrer"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-tertiary-900/90 via-tertiary-900/50 to-transparent"></div>
        </div>
        
        {/* Hero text content */}
        <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-2xl text-white pb-28 md:pb-36">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-4 leading-tight">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Dynamic Search & Filters Bar */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 sm:px-6 z-30">
          <EventFiltersBar locations={uniqueLocations} types={uniqueTypes} />
        </div>
      </div>

      {/* Categories Filter Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10 mt-8">
        {['ALL', 'ART', 'BUSINESS', 'EDUCATION', 'FESTIVAL', 'FOOD', 'NIGHTLIFE', 'SPORTS', 'MORE'].map((category) => {
          const isActive = category === currentActiveCategory;
          return (
            <Link
              key={category}
              href={buildUrl({ 
                category: category === 'ALL' ? undefined : category,
                type: category === 'ALL' ? undefined : category 
              })}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all border shadow-sm cursor-pointer ${
                isActive
                  ? 'border-primary-500 text-primary-600 bg-white hover:bg-primary-50 dark:bg-stone-900 dark:text-primary-400'
                  : 'bg-primary-500 text-primary-50 hover:bg-primary-600 border-transparent'
              }`}
            >
              {t(`categories.${category.toLowerCase()}` as Parameters<typeof t>[0])}
            </Link>
          );
        })}
      </div>

      {/* Dynamic Events Results Grid */}
      {displayedEvents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-earth-200/50 dark:border-stone-850 p-8 shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-earth-50 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 text-earth-500 dark:text-stone-400 text-2xl">
            📍
          </div>
          <h3 className="text-xl font-bold text-tertiary-900 dark:text-white mb-2 font-serif">{t('noEventsFound')}</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 max-w-xs mx-auto">
            {t('noEventsDesc')}
          </p>
          <Link 
            href="/events" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {t('clearFilters')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedEvents.map(event => {
            const startDateStr = formatDateTag(event.startDate, locale);
            const endDateStr = event.endDate ? formatDateTag(event.endDate, locale) : null;
            const dateDisplay = endDateStr && startDateStr !== endDateStr ? `${startDateStr} - ${endDateStr}` : startDateStr;

            return (
              <Link href={`/event/${event.id}`} key={event.id} className="group flex flex-col space-y-4 cursor-pointer">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
                  <Image 
                    src={event.imageUrl} 
                    alt={event.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer" 
                  />
                  
                  {/* Top Left Tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="bg-white/95 text-tertiary-900 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm">
                      {dateDisplay}
                    </span>
                    {(event.startTime || event.endTime) && (
                      <span className="bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                        {event.startTime}{event.startTime && event.endTime ? ' - ' : ''}{event.endTime}
                      </span>
                    )}
                  </div>
 
                  {/* Bottom Left Status */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    {event.status === 'coming_soon' && (
                      <span className="bg-purple-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        {t('status.comingSoon')}
                      </span>
                    )}
                    {event.status === 'completed' && (
                      <span className="bg-gray-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        {t('status.completed')}
                      </span>
                    )}
                    {event.status === 'ongoing' && (
                      <span className="bg-green-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        {t('status.ongoing')}
                      </span>
                    )}
                  </div>
 
                  {/* Top Right Tags */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                    {event.discountTag && (
                      <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs border border-white/20">
                        {event.discountTag}
                      </span>
                    )}
                  </div>
 
                  {/* Bottom Right Price Tag */}
                  {event.price !== undefined && (
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-white/95 text-tertiary-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                        {formatter.number(event.price, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <h3 className="font-bold text-lg text-tertiary-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-tertiary-600 dark:text-stone-400 mt-1 line-clamp-2">
                    {event.subtitle || event.description}
                  </p>
                  <p className="text-sm font-medium text-tertiary-500 dark:text-stone-500 mt-2 flex items-center gap-1.5">
                    📍 {event.location}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16">
          <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
