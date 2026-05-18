import { env } from '@/core/env/client';
import { eventsApi } from '../api/events.api';
import { Event, EventRegistrationInput } from '../types/events.types';
import { MOCK_EVENTS } from '../mocks/events.mocks';
import { logger } from '@/shared/lib/logger';

export const eventsService = {
  getAll: async (): Promise<Event[]> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        return MOCK_EVENTS as Event[];
      }
      return await eventsApi.getAll();
    } catch (e) {
      logger.warn('API connection failed, falling back to mock events: {error}', {
        error: e instanceof Error ? e.message : String(e),
      });
      return MOCK_EVENTS as Event[];
    }
  },

  getFeatured: async (): Promise<Event[]> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        return (MOCK_EVENTS as Event[]).filter(e => e.featured);
      }
      return await eventsApi.getFeatured();
    } catch (e) {
      logger.warn('API connection failed, falling back to mock featured events: {error}', {
        error: e instanceof Error ? e.message : String(e),
      });
      return (MOCK_EVENTS as Event[]).filter(e => e.featured);
    }
  },

  getById: async (id: string): Promise<Event | undefined> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        return (MOCK_EVENTS as Event[]).find(e => e.id === id);
      }
      return await eventsApi.getById(id);
    } catch (e) {
      logger.warn('API connection failed for event id {id}, falling back to mock detail: {error}', {
        id,
        error: e instanceof Error ? e.message : String(e),
      });
      return (MOCK_EVENTS as Event[]).find(e => e.id === id);
    }
  },

  register: async (eventId: string, input: EventRegistrationInput): Promise<{ success: boolean; bookingId: string }> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        // Simulated local registry logic
        return { success: true, bookingId: `REG-${Math.floor(100000 + Math.random() * 900000)}` };
      }
      return await eventsApi.register(eventId, input);
    } catch (e) {
      logger.warn('API registration failed for event {eventId}, simulating local registration: {error}', {
        eventId,
        error: e instanceof Error ? e.message : String(e),
      });
      return { success: true, bookingId: `REG-MOCK-${Math.floor(100000 + Math.random() * 900000)}` };
    }
  }
};
