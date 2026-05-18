import { apiInstance } from '@/shared/lib/api/axios';
import { BlogPost } from '../types/blogs.types';

export const blogsApi = {
  getAll: async (): Promise<BlogPost[]> => {
    const response = await apiInstance.get<BlogPost[]>('/blogs');
    return response.data;
  },

  getFeatured: async (): Promise<BlogPost[]> => {
    const response = await apiInstance.get<BlogPost[]>('/blogs/featured');
    return response.data;
  },

  getById: async (id: number | string): Promise<BlogPost> => {
    const response = await apiInstance.get<BlogPost>(`/blogs/${id}`);
    return response.data;
  }
};
