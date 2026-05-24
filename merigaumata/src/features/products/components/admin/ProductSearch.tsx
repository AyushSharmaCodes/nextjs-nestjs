"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/input';

interface ProductSearchProps {
  value: string;
  onChange: (val: string) => void;
  suggestions?: string[];
}

export function ProductSearch({ value, onChange, suggestions = [] }: ProductSearchProps) {
  const t = useTranslations('products');
  const [inputVal, setInputVal] = useState(value);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal value with parent
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // Debounced parent update
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(inputVal);
    }, 300);

    return () => clearTimeout(handler);
  }, [inputVal, onChange]);

  // Handle outside click to hide suggestions
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleClear = () => {
    setInputVal('');
    onChange('');
    setShowSuggest(false);
  };

  const selectSuggestion = (val: string) => {
    setInputVal(val);
    onChange(val);
    setShowSuggest(false);
    setActiveIndex(-1);
  };

  // Keyboard navigation inside dropdown suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggest || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggest(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full md:max-w-md z-20">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
        <Input
          type="text"
          value={inputVal}
          onFocus={() => setShowSuggest(true)}
          onKeyDown={handleKeyDown}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputVal(e.target.value);
            setShowSuggest(true);
            setActiveIndex(-1);
          }}
          placeholder={t('searchPlaceholder')}
          className="pl-10 pr-9 h-9 w-full bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus-visible:ring-stone-900/10 focus-visible:border-stone-400 dark:focus-visible:ring-stone-100/10 dark:focus-visible:border-stone-600 rounded-full shadow-sm"
        />
        {inputVal && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {showSuggest && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl shadow-lg max-h-56 overflow-y-auto overflow-x-hidden p-1.5" data-lenis-prevent>
          <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-850 mb-1">
            Suggestions Matches
          </div>
          <div className="flex flex-col gap-0.5">
            {suggestions.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item}
                  onClick={() => selectSuggestion(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={clsx(
                    'flex items-center justify-between w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer select-none',
                    isActive
                      ? 'bg-stone-55 border-l-2 border-stone-800 text-stone-900 dark:bg-stone-800 dark:border-stone-200 dark:text-stone-100'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  )}
                >
                  <span className="truncate pr-4">{item}</span>
                  {isActive && (
                    <CornerDownLeft className="h-3 w-3 opacity-50 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
