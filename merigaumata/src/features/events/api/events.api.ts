import { apiInstance } from '@/shared/lib/api/axios';
import { Event, EventRegistrationInput } from '../types/events.types';

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await apiInstance.get<Event[]>('/events');
    return response.data;
  },

  getFeatured: async (): Promise<Event[]> => {
    const response = await apiInstance.get<Event[]>('/events/featured');
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await apiInstance.get<Event>(`/events/${id}`);
    return response.data;
  },

  register: async (eventId: string, input: EventRegistrationInput): Promise<{ success: boolean; bookingId: string }> => {
    const response = await apiInstance.post<{ success: boolean; bookingId: string }>(`/events/${eventId}/register`, input);
    return response.data;
  }
};
