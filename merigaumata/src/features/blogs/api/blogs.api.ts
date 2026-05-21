import { apiInstance } from '@/shared/lib/api/axios';
import { ApiResponse } from '@/shared/lib/api/response';
import { BlogPost } from '../types/blogs.types';

export const blogsApi = {
  getAll: async (): Promise<BlogPost[]> => {
    const response = await apiInstance.get<ApiResponse<BlogPost[]>>('/blogs');
    return response.data.data;
  },

  getFeatured: async (): Promise<BlogPost[]> => {
    const response = await apiInstance.get<ApiResponse<BlogPost[]>>('/blogs/featured');
    return response.data.data;
  },

  getById: async (id: number | string): Promise<BlogPost> => {
    const response = await apiInstance.get<ApiResponse<BlogPost>>(`/blogs/${id}`);
    return response.data.data;
  }
};
