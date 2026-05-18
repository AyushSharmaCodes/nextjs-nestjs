"use client";

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoriesErrorBoundary({
  error,
  reset
}: ErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    // Log exception to logging services
    console.error('Categories boundary exception:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
      <div className="bg-card border border-earth-200 rounded-3xl p-8 max-w-md shadow-sm space-y-5 animate-scale-up">
        
        {/* Error icon wrapper */}
        <div className="h-14 w-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-serif font-bold text-foreground">Catalog compiling disrupted</h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            An exception occurred while resolving the multilingual category tree layout. The local schema has been preserved.
          </p>
        </div>

        {error.digest && (
          <div className="bg-earth-50 rounded-xl p-3 border border-earth-200 text-left">
            <span className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest">System Digest Reference</span>
            <code className="text-[10px] text-red-600 font-mono font-bold break-all select-all">{error.digest}</code>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={reset}
            className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Retry layout
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2.5 border border-earth-200 text-foreground/75 hover:bg-earth-100 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>

      </div>
    </div>
  );
}
