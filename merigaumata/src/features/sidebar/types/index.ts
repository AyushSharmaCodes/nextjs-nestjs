import React from 'react';

export interface SidebarRoute {
  id: string;
  labelKey: string; // References keys in the locales dictionary (e.g. "dashboard")
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: {
    textKey: string; // Can be a direct string or lookup key
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  };
  permissions?: string[];
  featureFlag?: string;
  children?: SidebarRoute[];
}

export interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  expandedGroups: string[];
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleGroup: (key: string) => void;
}
