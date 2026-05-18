import { env } from '@/core/env/client';
import { blogsApi } from '../api/blogs.api';
import { BlogPost } from '../types/blogs.types';
import { MOCK_BLOGS } from '../mocks/blogs.mocks';
import { logger } from '@/shared/lib/logger';

export const blogsService = {
  getAll: async (): Promise<BlogPost[]> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        return MOCK_BLOGS as BlogPost[];
      }
      return await blogsApi.getAll();
    } catch (e) {
      logger.warn('API connection failed, falling back to mock blogs: {error}', {
        error: e instanceof Error ? e.message : String(e),
      });
      return MOCK_BLOGS as BlogPost[];
    }
  },

  getFeatured: async (): Promise<BlogPost[]> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        return (MOCK_BLOGS as BlogPost[]).filter(b => b.featured);
      }
      return await blogsApi.getFeatured();
    } catch (e) {
      logger.warn('API connection failed, falling back to mock featured blogs: {error}', {
        error: e instanceof Error ? e.message : String(e),
      });
      return (MOCK_BLOGS as BlogPost[]).filter(b => b.featured);
    }
  },

  getById: async (id: number | string): Promise<BlogPost | undefined> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        const idNum = typeof id === 'string' ? parseInt(id) : id;
        return (MOCK_BLOGS as BlogPost[]).find(b => b.id === idNum);
      }
      return await blogsApi.getById(id);
    } catch (e) {
      logger.warn('API connection failed for blog post {id}, falling back to mock detail: {error}', {
        id,
        error: e instanceof Error ? e.message : String(e),
      });
      const idNum = typeof id === 'string' ? parseInt(id) : id;
      return (MOCK_BLOGS as BlogPost[]).find(b => b.id === idNum);
    }
  }
};
