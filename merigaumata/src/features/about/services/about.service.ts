import { env } from '@/core/env/client';
import { aboutApi } from '../api/about.api';
import { 
  MOCK_COW_STATS, 
  MOCK_TIMELINE, 
  MOCK_TEAM_MEMBERS, 
  MOCK_TESTIMONIALS_ROW1, 
  MOCK_TESTIMONIALS_ROW2 
} from '../mocks/about.mocks';
import { CowStat, TimelineItem, TeamMember, Testimonial } from '../types/about.types';
import { logger } from '@/shared/lib/logger';

const isProductionApi = !!env.NEXT_PUBLIC_API_URL;

export const aboutService = {
  getStats: async (): Promise<CowStat[]> => {
    if (isProductionApi) {
      try {
        return await aboutApi.getStats();
      } catch (error) {
        logger.warn('Axios call failed for stats. Falling back to mocks: {error}', {
          error: error instanceof Error ? error.message : String(error),
        });
        return MOCK_COW_STATS;
      }
    }
    return MOCK_COW_STATS;
  },

  getTimeline: async (): Promise<TimelineItem[]> => {
    if (isProductionApi) {
      try {
        return await aboutApi.getTimeline();
      } catch (error) {
        logger.warn('Axios call failed for timeline. Falling back to mocks: {error}', {
          error: error instanceof Error ? error.message : String(error),
        });
        return MOCK_TIMELINE;
      }
    }
    return MOCK_TIMELINE;
  },

  getTeam: async (): Promise<TeamMember[]> => {
    if (isProductionApi) {
      try {
        return await aboutApi.getTeam();
      } catch (error) {
        logger.warn('Axios call failed for team. Falling back to mocks: {error}', {
          error: error instanceof Error ? error.message : String(error),
        });
        return MOCK_TEAM_MEMBERS;
      }
    }
    return MOCK_TEAM_MEMBERS;
  },

  getTestimonials: async (row: number): Promise<Testimonial[]> => {
    if (isProductionApi) {
      try {
        return await aboutApi.getTestimonials(row);
      } catch (error) {
        logger.warn('Axios call failed for testimonials row {row}. Falling back to mocks: {error}', {
          row,
          error: error instanceof Error ? error.message : String(error),
        });
        return row === 1 ? MOCK_TESTIMONIALS_ROW1 : MOCK_TESTIMONIALS_ROW2;
      }
    }
    return row === 1 ? MOCK_TESTIMONIALS_ROW1 : MOCK_TESTIMONIALS_ROW2;
  }
};
