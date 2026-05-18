import { apiInstance } from '@/shared/lib/api/axios';
import { CowStat, TimelineItem, TeamMember, Testimonial } from '../types/about.types';

export const aboutApi = {
  getStats: async (): Promise<CowStat[]> => {
    const response = await apiInstance.get<CowStat[]>('/about/stats');
    return response.data;
  },

  getTimeline: async (): Promise<TimelineItem[]> => {
    const response = await apiInstance.get<TimelineItem[]>('/about/timeline');
    return response.data;
  },

  getTeam: async (): Promise<TeamMember[]> => {
    const response = await apiInstance.get<TeamMember[]>('/about/team');
    return response.data;
  },

  getTestimonials: async (row: number): Promise<Testimonial[]> => {
    const response = await apiInstance.get<Testimonial[]>(`/about/testimonials`, {
      params: { row }
    });
    return response.data;
  }
};
