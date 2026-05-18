import { create } from 'zustand';
import { GetNotificationsQuery, NotificationStatus, NotificationType } from '../types';

interface NotificationStore {
  selectedIds: string[];
  filters: GetNotificationsQuery;
  
  // Selection Handlers
  selectId: (id: string) => void;
  deselectId: (id: string) => void;
  toggleSelectId: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Filter state mutators
  setSearch: (search: string) => void;
  setStatus: (status: NotificationStatus | 'all') => void;
  setType: (type: NotificationType | 'all') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: GetNotificationsQuery = {
  page: 1,
  limit: 20,
  search: '',
  status: 'all',
  type: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  selectedIds: [],
  filters: DEFAULT_FILTERS,

  selectId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds
        : [...state.selectedIds, id],
    })),

  deselectId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((x) => x !== id),
    })),

  toggleSelectId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  
  clearSelection: () => set({ selectedIds: [] }),

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search, page: 1 },
    })),

  setStatus: (status) =>
    set((state) => ({
      filters: { ...state.filters, status, page: 1 },
    })),

  setType: (type) =>
    set((state) => ({
      filters: { ...state.filters, type, page: 1 },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),

  setLimit: (limit) =>
    set((state) => ({
      filters: { ...state.filters, limit, page: 1 },
    })),

  setSort: (sortBy, sortOrder) =>
    set((state) => ({
      filters: { ...state.filters, sortBy, sortOrder },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, selectedIds: [] }),
}));
