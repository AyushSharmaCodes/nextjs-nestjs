'use client';

import React from 'react';
import { Skeleton, SkeletonTextRows } from '@/shared/components/Skeleton';

export default function AdminSkeleton() {
  return (
    <div className="w-full flex min-h-[80vh] bg-stone-50 dark:bg-stone-950/20 rounded-3xl overflow-hidden border border-stone-200/40 dark:border-stone-850/40 shadow-inner">
      
      {/* Sidebar Navigation skeleton (desktop) */}
      <div className="hidden md:block w-64 bg-white dark:bg-[#121212] border-r border-stone-200/40 dark:border-stone-800/40 p-6 space-y-8">
        {/* Brand/logo block */}
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={36} height={36} />
          <div className="space-y-1.5 flex-1">
            <Skeleton variant="text" width="70%" className="h-4" />
            <Skeleton variant="text" width="40%" className="h-3" />
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="space-y-4 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <Skeleton variant="rectangular" width={22} height={22} className="rounded-md" />
              <Skeleton variant="text" width={i === 0 ? '70%' : i === 2 ? '50%' : '60%'} className="h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Admin Dashboard Body Content Panel */}
      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-hidden">
        
        {/* Header Breadcrumbs & Action Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton variant="text" width="180px" className="h-7" />
            <Skeleton variant="text" width="280px" className="h-4" />
          </div>
          <Skeleton variant="rectangular" width="140px" className="h-10 rounded-xl" />
        </div>

        {/* 4 Columns Quick Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#121212] border border-stone-200/40 dark:border-stone-800/40 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <Skeleton variant="text" width="50%" className="h-4" />
                <Skeleton variant="circular" width={24} height={24} />
              </div>
              <div className="space-y-1">
                <Skeleton variant="text" width="75%" className="h-8 font-bold" />
                <Skeleton variant="text" width="40%" className="h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Large Data Table Grid Panel */}
        <div className="bg-white dark:bg-[#121212] border border-stone-200/40 dark:border-stone-800/40 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header Filter options */}
          <div className="p-5 border-b border-stone-100 dark:border-stone-850/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Skeleton variant="rectangular" width="220px" className="h-9.5 rounded-lg" />
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Skeleton variant="rectangular" width="90px" className="h-9 rounded-lg" />
              <Skeleton variant="rectangular" width="90px" className="h-9 rounded-lg" />
            </div>
          </div>

          {/* Table Columns Rows */}
          <div className="p-5 space-y-4">
            {/* Headers row */}
            <div className="grid grid-cols-5 gap-4 pb-3 border-b border-stone-100 dark:border-stone-850/40">
              <Skeleton variant="text" width="60%" className="h-4 font-bold" />
              <Skeleton variant="text" width="40%" className="h-4 font-bold" />
              <Skeleton variant="text" width="70%" className="h-4 font-bold" />
              <Skeleton variant="text" width="50%" className="h-4 font-bold" />
              <Skeleton variant="text" width="30%" className="h-4 font-bold text-right ml-auto" />
            </div>

            {/* Content list rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-2 border-b border-stone-100/40 dark:border-stone-850/20 last:border-0 items-center">
                <div className="flex items-center gap-2.5">
                  <Skeleton variant="circular" width={28} height={28} />
                  <Skeleton variant="text" width="70%" className="h-4" />
                </div>
                <Skeleton variant="text" width="50%" className="h-4" />
                <Skeleton variant="rectangular" width="75px" className="h-5.5 rounded-full" />
                <Skeleton variant="text" width="60%" className="h-4" />
                <Skeleton variant="rectangular" width="65px" className="h-8 rounded-lg ml-auto" />
              </div>
            ))}
          </div>

          {/* Table Paginator footer */}
          <div className="px-5 py-4 bg-stone-50/50 dark:bg-stone-900/10 border-t border-stone-100 dark:border-stone-850/40 flex justify-between items-center">
            <Skeleton variant="text" width="140px" className="h-4" />
            <div className="flex items-center gap-2">
              <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
              <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
