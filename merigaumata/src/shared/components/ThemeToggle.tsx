'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 sm:p-2.5 text-neutral-500 dark:text-neutral-400 hover:text-tertiary-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors relative"
      aria-label="Toggle theme"
    >
      <Sun className="h-[22px] w-[22px] dark:hidden" strokeWidth={1.5} />
      <Moon className="h-[22px] w-[22px] hidden dark:block" strokeWidth={1.5} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
