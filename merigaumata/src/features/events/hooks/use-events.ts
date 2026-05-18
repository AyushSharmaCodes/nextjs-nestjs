import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../services/events.service';
import { EventRegistrationInput } from '../types/events.types';
import { logError } from '@/shared/lib/errors';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  featured: () => [...eventKeys.all, 'featured'] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export function useEventsQuery() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => eventsService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes stale
  });
}

export function useFeaturedEventsQuery() {
  return useQuery({
    queryKey: eventKeys.featured(),
    queryFn: () => eventsService.getFeatured(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventDetailQuery(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegisterEventMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: string; input: EventRegistrationInput }) =>
      eventsService.register(eventId, input),
    onSuccess: (data, variables) => {
      // Invalidate specific event details so count updates
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: (error, variables) => {
      logError(error, {
        feature: 'events',
        action: 'register',
        eventId: variables.eventId
      });
    }
  });
}
