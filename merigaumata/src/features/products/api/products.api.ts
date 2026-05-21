import { apiInstance } from '@/shared/lib/api/axios';
import { ApiResponse } from '@/shared/lib/api/response';
import { Product, ProductWithDetails, ShopFilters, Review } from '../types/products.types';
import { ProductQueryInput, ReviewInput } from '../schemas/products.schema';

export const productsApi = {
  getProducts: async (params?: ProductQueryInput): Promise<Product[]> => {
    const response = await apiInstance.get<ApiResponse<Product[]>>('/products', { params });
    return response.data.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiInstance.get<ApiResponse<Product[]>>('/products/featured');
    return response.data.data;
  },

  getProductById: async (id: string): Promise<ProductWithDetails> => {
    const response = await apiInstance.get<ApiResponse<ProductWithDetails>>(`/products/${id}`);
    return response.data.data;
  },

  getProductFilters: async (): Promise<ShopFilters> => {
    const response = await apiInstance.get<ApiResponse<ShopFilters>>('/products/filters');
    return response.data.data;
  },

  getProductReviews: async (productId: string, category: string): Promise<Review[]> => {
    const response = await apiInstance.get<ApiResponse<Review[]>>(`/products/${productId}/reviews`, {
      params: { category }
    });
    return response.data.data;
  },

  createProductReview: async (productId: string, data: ReviewInput): Promise<Review> => {
    const response = await apiInstance.post<ApiResponse<Review>>(`/products/${productId}/reviews`, data);
    return response.data.data;
  }
};
