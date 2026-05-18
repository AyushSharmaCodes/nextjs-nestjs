import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { GetNotificationsQuery, PaginatedNotifications, BulkActionDto, Notification, NotificationStats } from '../types';
import { useEffect } from 'react';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: GetNotificationsQuery) => [...notificationKeys.lists(), filters] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
};

export function useNotificationsQuery(filters: GetNotificationsQuery) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationsApi.getNotifications(filters),
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationStatsQuery() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => mockNotificationApiWrapper(),
    staleTime: 5 * 1000,
  });
}

// Simple fallback helper to avoid service compile errors
async function mockNotificationApiWrapper(): Promise<NotificationStats> {
  const { mockNotificationApi } = await import('../services/mockNotificationApi');
  return mockNotificationApi.getStats();
}

export function useMarkNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => notificationsApi.markAsRead(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousQueries = queryClient.getQueriesData<PaginatedNotifications>({
        queryKey: notificationKeys.lists(),
      });
      const previousStats = queryClient.getQueryData<NotificationStats>(notificationKeys.stats());

      // Optimistically update active lists in cache
      queryClient.setQueriesData<PaginatedNotifications>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              ids.includes(item.id) ? { ...item, status: 'read' as const } : item
            ),
          };
        }
      );

      // Optimistically update counts stats in cache
      if (previousStats) {
        queryClient.setQueryData<NotificationStats>(notificationKeys.stats(), {
          ...previousStats,
          unread: Math.max(0, previousStats.unread - ids.length),
          read: previousStats.read + ids.length,
        });
      }

      return { previousQueries, previousStats };
    },
    onError: (err, ids, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]: [any, any]) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(notificationKeys.stats(), context.previousStats);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousQueries = queryClient.getQueriesData<PaginatedNotifications>({
        queryKey: notificationKeys.lists(),
      });
      const previousStats = queryClient.getQueryData<NotificationStats>(notificationKeys.stats());

      queryClient.setQueriesData<PaginatedNotifications>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) => ({ ...item, status: 'read' as const })),
          };
        }
      );

      if (previousStats) {
        queryClient.setQueryData<NotificationStats>(notificationKeys.stats(), {
          ...previousStats,
          unread: 0,
          read: previousStats.read + previousStats.unread,
        });
      }

      return { previousQueries, previousStats };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]: [any, any]) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(notificationKeys.stats(), context.previousStats);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => notificationsApi.deleteNotifications(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousQueries = queryClient.getQueriesData<PaginatedNotifications>({
        queryKey: notificationKeys.lists(),
      });
      const previousStats = queryClient.getQueryData<NotificationStats>(notificationKeys.stats());

      queryClient.setQueriesData<PaginatedNotifications>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          const filtered = old.data.filter((item) => !ids.includes(item.id));
          return {
            ...old,
            data: filtered,
            meta: {
              ...old.meta,
              totalCount: Math.max(0, old.meta.totalCount - ids.length),
            },
          };
        }
      );

      return { previousQueries, previousStats };
    },
    onError: (err, ids, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]: [any, any]) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(notificationKeys.stats(), context.previousStats);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useExecuteBulkActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BulkActionDto) => notificationsApi.executeBulkAction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useNotificationSSE() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>;
      const newNotif = customEvent.detail;

      queryClient.setQueriesData<PaginatedNotifications>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          if (old.data.some((x) => x.id === newNotif.id)) return old;

          return {
            ...old,
            data: [newNotif, ...old.data].slice(0, old.meta.limit),
            meta: {
              ...old.meta,
              totalCount: old.meta.totalCount + 1,
            },
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    };

    window.addEventListener('merigaumata-notification-sse', handleNewNotification);
    
    return () => {
      window.removeEventListener('merigaumata-notification-sse', handleNewNotification);
    };
  }, [queryClient]);
}
