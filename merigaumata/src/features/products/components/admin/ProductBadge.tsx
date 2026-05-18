import React from 'react';
import { clsx } from 'clsx';

interface ProductBadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'draft' | 'archived' | 'low-stock' | 'out-of-stock' | 'default';
  className?: string;
}

export function ProductBadge({ children, variant = 'default', className }: ProductBadgeProps) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    draft: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    archived: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-900/40 dark:text-stone-400 dark:border-stone-800/80',
    'low-stock': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    'out-of-stock': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    default: 'bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-900/20 dark:text-stone-300 dark:border-stone-800/50',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-200 select-none',
        styles[variant],
        className
      )}
    >
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
