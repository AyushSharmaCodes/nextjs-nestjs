'use client';

import React, { createContext, useContext, useEffect, useState, useTransition, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { logger } from '@/shared/lib/logger';
import ProgressBar from './progress-bar';
import RouteLoader from './route-loader';

interface NavigationLoadingContextType {
  startLoading: (customMessage?: string) => void;
  stopLoading: () => void;
  isLoading: boolean;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error('useNavigationLoading must be used within a GlobalNavigationLoadingProvider');
  }
  return context;
}

export default function GlobalNavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('loading');
  const [, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  // Automatically resolve localized loader text based on target route string
  const getRouteMessage = useCallback((href: string): string => {
    // Normalise path (removing locale prefix if exists)
    const cleanHref = href.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
    
    if (cleanHref.startsWith('/shop')) return t('shop');
    if (cleanHref.startsWith('/blogs') || cleanHref.startsWith('/blog')) return t('blogs');
    if (cleanHref.startsWith('/events') || cleanHref.startsWith('/event')) return t('events');
    if (cleanHref.startsWith('/contact')) return t('contact');
    if (cleanHref.startsWith('/gallery')) return t('gallery');
    if (cleanHref.startsWith('/profile')) return t('profile');
    if (cleanHref.startsWith('/about')) return t('about');
    if (cleanHref.startsWith('/admin')) return t('admin');
    
    return t('generic');
  }, [t]);

  const startLoading = useCallback((customMessage?: string) => {
    setIsLoading(true);
    setProgress(15);
    setMessage(customMessage || t('generic'));
  }, [t]);

  const stopLoading = useCallback(() => {
    setProgress(100);
    setIsLoading(false);
  }, []);

  const lastPathname = useRef(pathname);

  // 1. Listen to path mutations to immediately resolve the transition
  useEffect(() => {
    if (pathname !== lastPathname.current) {
      lastPathname.current = pathname;
      stopLoading();
    }
  }, [pathname, stopLoading]);

  // 2. Linear/logarithmic incremental progression simulation when navigating
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const remaining = 90 - prev;
        // Step increases slowly as it approaches 90%
        const step = Math.max(1, Math.floor(remaining * 0.12));
        return prev + step;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isLoading]);

  // 3. Delegate click events globally on window for instantaneous, robust feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Find the nearest enclosing anchor tag
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      
      // Safety checks: Skip if not an internal or valid page redirect link
      if (!href) return;
      if (href.startsWith('#')) return; // Hash anchor on same page
      if (anchor.getAttribute('target') === '_blank') return;
      if (anchor.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // Modifier keys opens new tab/window
      
      // Skip protocols
      if (
        href.startsWith('tel:') || 
        href.startsWith('mailto:') || 
        href.startsWith('javascript:') || 
        href.startsWith('sms:')
      ) {
        return;
      }
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return; // External site
        
        // Normalize paths by removing locale prefixes for accurate comparison
        const cleanTarget = url.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
        const cleanCurrent = window.location.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
        
        // Skip same-path same-params transitions (already loaded)
        if (cleanTarget === cleanCurrent && url.search === window.location.search) {
          // If hash varies, let default browser jump handle it
          return;
        }

        // Start premium loading feedback instantly (no startTransition delay)
        const loadingMsg = getRouteMessage(url.pathname);
        startLoading(loadingMsg);
      } catch (err) {
        // Fallback for relative or parse errors
        logger.warn('URL parsing error in navigation handler: {error}', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };

    window.addEventListener('click', handleAnchorClick, { capture: true });
    return () => window.removeEventListener('click', handleAnchorClick, { capture: true });
  }, [getRouteMessage, startLoading]);

  return (
    <NavigationLoadingContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      {/* Top micro progress bar */}
      <ProgressBar progress={progress} visible={isLoading} />
      
      {/* Non-blocking bottom status panel card with smart 150ms delay threshold */}
      <RouteLoader visible={isLoading} message={message} delayMs={150} />
      
      {children}
    </NavigationLoadingContext.Provider>
  );
}
