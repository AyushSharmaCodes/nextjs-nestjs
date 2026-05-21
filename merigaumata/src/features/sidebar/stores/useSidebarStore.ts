import { create } from 'zustand';
import { persist, createJSONStorage, StorageValue } from 'zustand/middleware';
import { SidebarState } from '../types';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      expandedGroups: [],

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
      toggleGroup: (key) =>
        set((state) => {
          const isExpanded = state.expandedGroups.includes(key);
          const expandedGroups = isExpanded
            ? state.expandedGroups.filter((g) => g !== key)
            : [...state.expandedGroups, key];
          return { expandedGroups };
        }),
    }),
    {
      name: 'merigaumata-sidebar-preferences',
      storage: createJSONStorage(getStorage),
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        expandedGroups: state.expandedGroups,
      }),
    }
  )
);
