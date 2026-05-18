'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, ChevronDown, Calendar, MapPin, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EventFiltersBarProps {
  locations: string[];
  types: string[];
}

export function EventFiltersBar({ locations, types }: EventFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('events');

  // Active search query from URL params (derived rendering state)
  const searchVal = searchParams.get('search') || '';

  // Active dropdown state
  const [activeDropdown, setActiveDropdown] = useState<'date' | 'location' | 'type' | null>(null);

  // Dropdown refs to detect outside click
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const updateFilters = (updates: { search?: string; date?: string; location?: string; type?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }
    
    if (updates.date !== undefined) {
      if (updates.date) params.set('date', updates.date);
      else params.delete('date');
    }
    
    if (updates.location !== undefined) {
      if (updates.location) params.set('location', updates.location);
      else params.delete('location');
    }
    
    if (updates.type !== undefined) {
      if (updates.type) {
        params.set('type', updates.type);
        params.set('category', updates.type);
      } else {
        params.delete('type');
        params.delete('category');
      }
    }

    params.set('page', '1'); // reset page
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters({ search: (formData.get('search') as string) || '' });
  };

  const dateOptions = [
    { label: 'Any Date', value: '' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Past', value: 'past' },
    { label: 'May 2026', value: '2026-05' },
    { label: 'June 2026', value: '2026-06' },
    { label: 'July 2026', value: '2026-07' }
  ];

  const currentDateVal = searchParams.get('date') || '';
  const currentDateLabel = dateOptions.find(o => o.value === currentDateVal)?.label || 'Select';

  const currentLocationVal = searchParams.get('location') || '';
  const currentLocationLabel = currentLocationVal 
    ? currentLocationVal.length > 15 ? currentLocationVal.substring(0, 15) + '...' : currentLocationVal
    : 'Select';

  const currentTypeVal = searchParams.get('type') || '';
  const currentTypeLabel = currentTypeVal || 'Select';

  return (
    <div ref={containerRef} className="relative z-30 w-full">
      <form 
        onSubmit={handleSearchSubmit} 
        className="bg-white dark:bg-stone-900 rounded-3xl p-2.5 flex flex-col lg:flex-row items-center gap-3 lg:gap-4 shadow-xl text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-stone-800"
      >
        {/* Search input field */}
        <div className="flex items-center gap-3 flex-1 w-full px-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input 
            key={searchVal}
            type="text" 
            name="search"
            placeholder="Search by name or type" 
            defaultValue={searchVal}
            className="flex-1 py-2.5 bg-transparent focus:outline-none w-full text-[14.5px] placeholder:text-stone-400/80 text-stone-900 dark:text-white"
          />
          {searchVal && (
            <button 
              type="button" 
              onClick={() => { updateFilters({ search: '' }); }}
              className="p-1 rounded-full hover:bg-stone-150 dark:hover:bg-stone-800 text-stone-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Separator and filters section */}
        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 sm:gap-0 lg:border-l lg:border-stone-200 dark:lg:border-stone-800 w-full lg:w-auto text-left">
          
          {/* Date Selector */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
              className={`flex flex-col px-5 py-2.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-850 w-full text-left transition-colors ${activeDropdown === 'date' ? 'bg-stone-50 dark:bg-stone-850' : ''}`}
            >
              <span className="text-[10.5px] font-black uppercase tracking-widest text-[#1B8057] flex items-center gap-1.5 animate-pulse">
                <Calendar className="w-3 h-3" />
                Date
              </span>
              <span className="text-sm font-semibold text-stone-500 dark:text-stone-300 mt-0.5 flex items-center gap-1">
                {currentDateLabel}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </span>
            </button>
            
            {activeDropdown === 'date' && (
              <div
                className="absolute left-0 mt-2 w-52 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl py-2 z-50 overflow-y-auto max-h-60 ring-1 ring-black/5 transition-all duration-200"
              >
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      updateFilters({ date: opt.value });
                      setActiveDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors ${currentDateVal === opt.value ? 'text-[#1B8057] bg-stone-50/55 dark:bg-stone-850/55' : 'text-stone-700 dark:text-stone-300'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Selector */}
          <div className="relative flex-1 sm:flex-initial sm:border-l border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
              className={`flex flex-col px-5 py-2.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-850 w-full text-left transition-colors ${activeDropdown === 'location' ? 'bg-stone-50 dark:bg-stone-850' : ''}`}
            >
              <span className="text-[10.5px] font-black uppercase tracking-widest text-[#1B8057] flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                Location
              </span>
              <span className="text-sm font-semibold text-stone-500 dark:text-stone-300 mt-0.5 flex items-center gap-1">
                {currentLocationLabel}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </span>
            </button>
            
            {activeDropdown === 'location' && (
              <div
                className="absolute left-0 mt-2 w-60 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl py-2 z-50 overflow-y-auto max-h-60 ring-1 ring-black/5 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    updateFilters({ location: '' });
                    setActiveDropdown(null);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors ${currentLocationVal === '' ? 'text-[#1B8057] bg-stone-50/55' : 'text-stone-700 dark:text-stone-300'}`}
                >
                  Any Location
                </button>
                {locations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      updateFilters({ location: loc });
                      setActiveDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors ${currentLocationVal === loc ? 'text-[#1B8057] bg-stone-50/55' : 'text-stone-700 dark:text-stone-300'}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type/Category Selector */}
          <div className="relative flex-1 sm:flex-initial sm:border-l border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
              className={`flex flex-col px-5 py-2.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-850 w-full text-left transition-colors ${activeDropdown === 'type' ? 'bg-stone-50 dark:bg-stone-850' : ''}`}
            >
              <span className="text-[10.5px] font-black uppercase tracking-widest text-[#1B8057] flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                Type
              </span>
              <span className="text-sm font-semibold text-stone-500 dark:text-stone-300 mt-0.5 flex items-center gap-1">
                {currentTypeLabel}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </span>
            </button>
            
            {activeDropdown === 'type' && (
              <div
                className="absolute left-0 mt-2 w-52 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl py-2 z-50 overflow-y-auto max-h-60 ring-1 ring-black/5 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    updateFilters({ type: '' });
                    setActiveDropdown(null);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors ${currentTypeVal === '' ? 'text-[#1B8057] bg-stone-50/55' : 'text-stone-700 dark:text-stone-300'}`}
                >
                  All Types
                </button>
                {types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      updateFilters({ type: type });
                      setActiveDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors ${currentTypeVal === type ? 'text-[#1B8057] bg-stone-50/55' : 'text-stone-700 dark:text-stone-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Search Submit Button */}
        <button 
          type="submit" 
          className="bg-emerald-50 dark:bg-stone-800 p-3.5 rounded-2xl border border-emerald-100 dark:border-stone-750 text-[#1B8057] dark:text-emerald-450 hover:bg-[#1B8057] hover:text-white dark:hover:bg-[#1B8057] dark:hover:text-white transition-all w-full lg:w-auto flex items-center justify-center gap-2 active:scale-95 shadow-sm shrink-0 cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="lg:hidden font-bold uppercase tracking-wider text-xs">Search</span>
        </button>
      </form>
    </div>
  );
}

interface XProps {
  className?: string;
}

function X({ className }: XProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
