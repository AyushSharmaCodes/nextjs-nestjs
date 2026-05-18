import { apiInstance } from '@/shared/lib/api/axios';
import { Product, ProductWithDetails, ShopFilters, Review } from '../types/products.types';
import { ProductQueryInput, ReviewInput } from '../schemas/products.schema';

export const productsApi = {
  getProducts: async (params?: ProductQueryInput): Promise<Product[]> => {
    const response = await apiInstance.get<Product[]>('/products', { params });
    return response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiInstance.get<Product[]>('/products/featured');
    return response.data;
  },

  getProductById: async (id: string): Promise<ProductWithDetails> => {
    const response = await apiInstance.get<ProductWithDetails>(`/products/${id}`);
    return response.data;
  },

  getProductFilters: async (): Promise<ShopFilters> => {
    const response = await apiInstance.get<ShopFilters>('/products/filters');
    return response.data;
  },

  getProductReviews: async (productId: string, category: string): Promise<Review[]> => {
    const response = await apiInstance.get<Review[]>(`/products/${productId}/reviews`, {
      params: { category }
    });
    return response.data;
  },

  createProductReview: async (productId: string, data: ReviewInput): Promise<Review> => {
    const response = await apiInstance.post<Review>(`/products/${productId}/reviews`, data);
    return response.data;
  }
};
