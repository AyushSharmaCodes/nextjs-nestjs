"use client";

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronsUpDown, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '../stores/useSidebarStore';

export function SidebarProfile() {
  const t = useTranslations('admin.AdminSidebar');
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer outline-none hover:bg-earth-100/50 focus-visible:ring-2 focus-visible:ring-primary-500/50 select-none border border-transparent hover:border-earth-200/50 dark:hover:bg-earth-900/20 dark:hover:border-earth-800/40",
            isCollapsed ? "justify-center" : ""
          )}
          aria-label={t('editProfile')}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-earth-200 overflow-hidden border border-earth-200/80 dark:border-transparent shadow-inner flex-shrink-0">
              <img 
                src="https://i.pravatar.cc/100?img=5" 
                alt="Admin Profile" 
                className="h-full w-full object-cover" 
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left truncate">
                <span className="text-sm font-semibold text-foreground/90 truncate leading-none mb-1">admin</span>
                <span className="text-[11px] text-foreground/45 truncate leading-none">admin@gmail.com</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronsUpDown className="h-4 w-4 text-foreground/45 flex-shrink-0" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={isCollapsed ? "center" : "end"}
          side={isCollapsed ? "right" : "top"}
          sideOffset={isCollapsed ? 16 : 8}
          className={cn(
            "z-50 min-w-[200px] overflow-hidden rounded-xl border border-earth-200 bg-card p-1 text-foreground shadow-lg select-none outline-none dark:border-transparent",
            "animate-in fade-in duration-100 slide-in-from-bottom-2"
          )}
        >
          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer outline-none text-foreground/80 hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-foreground/45" />
            {t('dashboard')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer outline-none text-foreground/80 hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4 text-foreground/45" />
            {t('editProfile')}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-earth-100/60 dark:bg-earth-900/30 my-1" />
          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 cursor-pointer outline-none text-foreground/80 font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
