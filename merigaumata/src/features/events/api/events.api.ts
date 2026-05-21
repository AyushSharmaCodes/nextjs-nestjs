import { apiInstance } from '@/shared/lib/api/axios';
import { ApiResponse } from '@/shared/lib/api/response';
import { Event, EventRegistrationInput } from '../types/events.types';

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await apiInstance.get<ApiResponse<Event[]>>('/events');
    return response.data.data;
  },

  getFeatured: async (): Promise<Event[]> => {
    const response = await apiInstance.get<ApiResponse<Event[]>>('/events/featured');
    return response.data.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await apiInstance.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data.data;
  },

  register: async (eventId: string, input: EventRegistrationInput): Promise<{ success: boolean; bookingId: string }> => {
    const response = await apiInstance.post<ApiResponse<{ success: boolean; bookingId: string }>>(`/events/${eventId}/register`, input);
    return response.data.data;
  }
};
