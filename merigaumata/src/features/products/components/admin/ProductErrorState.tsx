import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}

export function ProductErrorState({ error, onRetry }: ProductErrorStateProps) {
  const message = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-rose-50/30 dark:bg-rose-950/5 border border-rose-200/55 dark:border-rose-900/35 rounded-2xl shadow-sm min-h-[350px] w-full">
      <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 mb-4 shrink-0">
        <AlertCircle className="h-10 w-10 stroke-[1.25]" />
      </div>
      <h3 className="font-serif font-bold text-lg text-rose-900 dark:text-rose-400 mb-1.5">
        Failed to Load Products Catalog
      </h3>
      <p className="text-xs text-rose-700/80 dark:text-rose-400/85 max-w-sm font-medium mb-5 leading-relaxed font-mono">
        {message}
      </p>
      <Button
        onClick={onRetry}
        size="sm"
        className="h-9 px-4 text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 rounded-full select-none cursor-pointer font-bold shadow-sm"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Try Reloading Data</span>
      </Button>
    </div>
  );
}
