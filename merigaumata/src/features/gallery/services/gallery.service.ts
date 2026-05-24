import { env } from '@/core/env/client';
import { galleryApi } from '../api/gallery.api';
import { MOCK_GALLERIES } from '../mocks/gallery.mocks';
import { Gallery } from '../types/gallery.types';
import { logger } from '@/shared/lib/logger';

const isProductionApi = !!env.NEXT_PUBLIC_API_URL;

export const galleryService = {
  getAll: async (): Promise<Gallery[]> => {
    if (isProductionApi) {
      try {
        return await galleryApi.getAll();
      } catch (error: unknown) {
        logger.warn('Axios call failed for gallery. Falling back to mocks: {error}', {
          error: error instanceof Error ? error.message : String(error),
        });
        return MOCK_GALLERIES;
      }
    }
    return MOCK_GALLERIES;
  }
};
