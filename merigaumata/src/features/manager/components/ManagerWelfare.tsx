'use client';

import { AppIcon } from '@/shared/icons';

export function ManagerWelfare() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Cow Welfare Management</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Supervise Gau Shala medical logs, fodder supplies, and sanctuary residents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-5 rounded-xl border border-border bg-emerald-500/5 flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Health Status</span>
              <AppIcon name="sparkles" className="w-4 h-4 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-foreground mt-3 font-serif">100% Fit Resident Cows</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Daily vet visits, vaccinations, and natural herbs provided successfully.</p>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block">Status: Verified Healthy</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-amber-500/5 flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Feed & Fodder</span>
              <AppIcon name="award" className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-lg font-bold text-foreground mt-3 font-serif">1.2 Tons Organic Fodder</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Guar churi, fresh grass, and essential minerals balanced successfully.</p>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold block">Reserve: 18 Days Left</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col justify-between h-44">
          <div>
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Adoption Support</span>
            <h4 className="text-lg font-bold text-foreground mt-3 font-serif">89 Cows Supported</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Cows backed by monthly global patron programs.</p>
          </div>
          <span className="text-[11px] text-primary-500 font-bold block cursor-pointer hover:underline">View Patrons List →</span>
        </div>
      </div>
    </div>
  );
}
