'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // custom props if any
}

export function SearchInput({ className = '', ...props }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-surface-border rounded-lg leading-5 bg-surface-alt text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
        {...props}
      />
    </div>
  );
}
