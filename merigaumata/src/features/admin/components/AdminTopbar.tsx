"use client";

import React from 'react';
import { Search, PanelLeft, Command, Sun, Moon, User, Settings, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { NotificationDropdown } from '../../notifications/components/NotificationDropdown';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '../../sidebar/stores/useSidebarStore';

interface AdminTopbarProps {
  onOpenSidebar: () => void;
  title?: string; // Kept for API compatibility, though unused in the visual
}

export function AdminTopbar({ onOpenSidebar, title = "Dashboard" }: AdminTopbarProps) {
  const { toggleCollapsed } = useSidebarStore();
  const { setTheme, theme } = useTheme();
  const t = useTranslations('admin.AdminTopbar');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇮🇳', short: 'EN' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳', short: 'HI' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', short: 'TA' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳', short: 'TE' }
  ];

  const currentLang = LANGUAGES.find(lang => lang.code === locale) || LANGUAGES[0];

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.replace(newPath);
    router.refresh();
  };

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onOpenSidebar();
    } else {
      toggleCollapsed();
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-5 md:px-6 bg-card border-l border-r border-b border-earth-200/60 dark:border-transparent rounded-bl-2xl rounded-br-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] sticky top-0 z-30 ml-2 mr-2">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button 
          onClick={handleToggle}
          className="p-2 rounded-xl text-foreground/70 bg-white dark:bg-earth-900/60 border border-earth-200/85 dark:border-transparent hover:bg-earth-50 dark:hover:bg-earth-900/40 hover:text-foreground transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
        >
          <PanelLeft className="h-4.5 w-4.5" />
        </button>
        {/* Vertical Divider Line */}
        <div className="h-5 w-px bg-earth-200/80 dark:bg-earth-900/30" />
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center relative w-64 lg:w-80 mr-2">
          <Search className="absolute left-3 h-4 w-4 text-foreground/40" />
          <input 
            type="text" 
            placeholder={t.has('search') ? t('search') : "Search anything"} 
            className="h-9 w-full pl-9 pr-12 rounded-lg bg-earth-50 dark:bg-earth-900/50 border border-earth-200 dark:border-earth-800/80 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 text-sm text-foreground transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1 border border-earth-200 dark:border-earth-800/80 rounded px-1.5 py-0.5 bg-white dark:bg-earth-950 shadow-sm">
            <Command className="h-3 w-3 text-foreground/50 dark:text-foreground/40" />
            <span className="text-[10px] text-foreground/50 dark:text-foreground/40 font-bold">K</span>
          </div>
        </div>

        {/* Language */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-earth-50 dark:hover:bg-earth-900/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 select-none">
              <span className="text-base">{currentLang.flag}</span>
              <span>{currentLang.short}</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              side="bottom"
              sideOffset={8}
              className={cn(
                "z-50 min-w-[150px] overflow-hidden rounded-xl border border-earth-200 bg-card p-1.5 text-foreground shadow-lg select-none outline-none dark:border-transparent",
                "animate-in fade-in duration-100 slide-in-from-top-2"
              )}
            >
              {LANGUAGES.map((lang) => (
                <DropdownMenu.Item
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer outline-none transition-colors",
                    locale === lang.code ? "bg-primary-50/50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 font-medium" : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </div>
                  {locale === lang.code && (
                    <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs">✓</span>
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="h-5 w-5 hidden dark:block" />
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 hover:bg-earth-50 dark:hover:bg-earth-900/50 p-0.5 rounded-full transition-colors ml-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50">
              <div className="h-8 w-8 rounded-full bg-earth-200 overflow-hidden border border-earth-200 dark:border-earth-700 shadow-inner flex-shrink-0">
                 <img src="https://i.pravatar.cc/100?img=5" alt="Current User" className="h-full w-full object-cover" />
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              side="bottom"
              sideOffset={8}
              className={cn(
                "z-50 min-w-[240px] overflow-hidden rounded-xl border border-earth-200 bg-card p-1.5 text-foreground shadow-lg select-none outline-none dark:border-transparent",
                "animate-in fade-in duration-100 slide-in-from-top-2"
              )}
            >
              {/* Header */}
              <div className="px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground/95 leading-none mb-1.5">admin</p>
                <p className="text-[11px] text-foreground/45 leading-none">admin@gmail.com</p>
              </div>
              
              <DropdownMenu.Separator className="h-px bg-earth-100/60 dark:bg-earth-900/30 my-1" />

              {/* Items */}
              <DropdownMenu.Item
                className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer outline-none text-foreground/80 hover:text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-foreground/45 group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                  <span>{t('profile')}</span>
                </div>
                <kbd className="text-[10px] text-foreground/40 font-mono tracking-tight select-none">⇧⌘P</kbd>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer outline-none text-foreground/80 hover:text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-foreground/45 group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                  <span>{t('settings')}</span>
                </div>
                <kbd className="text-[10px] text-foreground/40 font-mono tracking-tight select-none">⌘S</kbd>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-earth-100/60 dark:bg-earth-900/30 my-1" />

              <DropdownMenu.Item
                className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 cursor-pointer outline-none text-foreground/80 font-medium transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="h-4 w-4 text-foreground/45 group-hover:text-red-500 dark:group-hover:text-red-400" />
                  <span>{t('logout')}</span>
                </div>
                <kbd className="text-[10px] text-foreground/40 font-mono tracking-tight select-none">⇧⌘Q</kbd>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
