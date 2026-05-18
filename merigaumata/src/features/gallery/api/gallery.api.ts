import { apiInstance } from '@/shared/lib/api/axios';
import { Gallery } from '../types/gallery.types';

export const galleryApi = {
  getAll: async (): Promise<Gallery[]> => {
    const response = await apiInstance.get<Gallery[]>('/gallery');
    return response.data;
  }
};
