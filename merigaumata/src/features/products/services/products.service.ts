import { env } from '@/core/env/client';
import { productsApi } from '../api/products.api';
import { delay } from '@/lib/utils';
import { 
  MOCK_PRODUCTS, 
  MOCK_SHOP_FILTERS, 
  getProductWithDetails, 
  getCategorySpecificReviews 
} from '../mocks/products.mocks';
import { Product, ProductWithDetails, ShopFilters, Review } from '../types/products.types';
import { ProductQueryInput, ReviewInput } from '../schemas/products.schema';
import { AdminProductInput } from '../schemas/adminProducts.schema';
import { logger } from '@/shared/lib/logger';

const STORAGE_KEY = 'admin_products_store';

const isBrowser = () => typeof window !== 'undefined';

// Load or seed products state in localStorage
const loadState = (): Product[] => {
  if (!isBrowser()) return MOCK_PRODUCTS;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    // Seed initial products enriched with mock stock/sold metadata & active status
    const enriched = MOCK_PRODUCTS.map((p, idx) => {
      const isOut = p.stock === 0;
      const isLow = p.stock > 0 && p.stock <= 5;
      
      let status: 'active' | 'draft' | 'archived' = 'active';
      if (isOut) {
        status = 'draft';
      } else if (idx % 7 === 0) {
        status = 'archived';
      }

      return {
        ...p,
        status,
        soldCount: 120 + (idx * 14) + (idx % 3 === 0 ? 5 : 0),
        isArchived: status === 'archived',
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    return enriched;
  }
  
  try {
    return JSON.parse(saved);
  } catch (err: unknown) {
    logger.error(`Failed to parse products store, falling back to seed mock:: {error}`, { error: String(err) });
    return MOCK_PRODUCTS;
  }
};

// Save products state to localStorage
const saveState = (products: Product[]) => {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
};

export const productsService = {
  getProducts: async (query?: ProductQueryInput & { status?: string }): Promise<{ products: Product[]; total: number }> => {
    try {
      if (env.NEXT_PUBLIC_API_URL) {
        const products = await productsApi.getProducts(query);
        return { products, total: products.length }; // Simplified for now
      }
    } catch (e: unknown) {
      logger.warn('API getProducts failed, falling back to mock: {error}', { error: String(e) });
    }

    await delay(350); // Simulate network latency
    let filtered = loadState();
    // ... (rest of the mock filtering logic)
    const total = filtered.length;
    return {
      products: filtered,
      total,
    };
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      if (env.NEXT_PUBLIC_API_URL) {
        return await productsApi.getFeaturedProducts();
      }
    } catch (e: unknown) {
      logger.warn('API getFeaturedProducts failed, falling back to mock: {error}', { error: String(e) });
    }

    await delay(200);
    return loadState().filter(p => p.featured && p.status === 'active');
  },

  getProductById: async (id: string): Promise<ProductWithDetails | undefined> => {
    try {
      if (env.NEXT_PUBLIC_API_URL) {
        return await productsApi.getProductById(id);
      }
    } catch (e: unknown) {
      logger.warn('API getProductById failed for {id}, falling back to mock: {error}', { id, error: String(e) });
    }

    await delay(250);
    const product = loadState().find(p => p.id === id);
    if (!product) return undefined;
    return getProductWithDetails(product);
  },

  getProductFilters: async (): Promise<ShopFilters> => {
    try {
      if (env.NEXT_PUBLIC_API_URL) {
        return await productsApi.getProductFilters();
      }
    } catch (e: unknown) {
      logger.warn('API getProductFilters failed, falling back to mock: {error}', { error: String(e) });
    }

    await delay(150);
    return MOCK_SHOP_FILTERS;
  },

  getProductReviews: async (productId: string, category: string): Promise<Review[]> => {
    try {
      if (env.NEXT_PUBLIC_API_URL) {
        return await productsApi.getProductReviews(productId, category);
      }
    } catch (e: unknown) {
      logger.warn('API getProductReviews failed, falling back to mock: {error}', { error: String(e) });
    }

    await delay(200);
    return getCategorySpecificReviews(productId, category);
  },

  createProductReview: async (productId: string, input: ReviewInput): Promise<Review> => {
    try {
      if (env.NEXT_PUBLIC_API_URL) {
        return await productsApi.createProductReview(productId, input);
      }
    } catch (e: unknown) {
      logger.warn('API createProductReview failed, falling back to mock: {error}', { error: String(e) });
    }

    await delay(300);
    const newReview: Review = {
      id: `${productId}-r-${Date.now()}`,
      name: input.name,
      rating: input.rating,
      date: 'Today',
      verified: true,
      text: input.text,
      images: [],
      helpfulCount: 0,
      unhelpfulCount: 0
    };
    return newReview;
  },

  // ==========================================
  // ADMIN DASHBOARD CRUD ACTIONS
  // ==========================================

  createProduct: async (input: AdminProductInput): Promise<Product> => {
    await delay(400);
    const all = loadState();
    
    const newProduct: Product = {
      ...input,
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      mrp: input.mrp || undefined,
      rating: 4.5,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      isArchived: input.status === 'archived',
    };

    all.unshift(newProduct);
    saveState(all);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    await delay(400);
    const all = loadState();
    const index = all.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    const updatedProduct: Product = {
      ...all[index],
      ...updates,
      isArchived: updates.status === 'archived' ? true : updates.status ? false : all[index].isArchived,
    };

    all[index] = updatedProduct;
    saveState(all);
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await delay(300);
    const all = loadState();
    const filtered = all.filter(p => p.id !== id);
    saveState(filtered);
    return true;
  },

  duplicateProduct: async (id: string): Promise<Product> => {
    await delay(400);
    const all = loadState();
    const product = all.find(p => p.id === id);

    if (!product) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    const duplicatedProduct: Product = {
      ...product,
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Math.random().toString(36).substr(2, 4)}`,
      soldCount: 0,
      reviewsCount: 0,
      rating: 4.0,
      createdAt: new Date().toISOString(),
    };

    // Place right after original
    const index = all.findIndex(p => p.id === id);
    all.splice(index + 1, 0, duplicatedProduct);
    saveState(all);
    return duplicatedProduct;
  },

  archiveProduct: async (id: string): Promise<Product> => {
    return productsService.updateProduct(id, { status: 'archived', isArchived: true });
  },

  bulkDeleteProducts: async (ids: string[]): Promise<boolean> => {
    await delay(400);
    const all = loadState();
    const filtered = all.filter(p => !ids.includes(p.id));
    saveState(filtered);
    return true;
  },

  bulkArchiveProducts: async (ids: string[]): Promise<boolean> => {
    await delay(400);
    const all = loadState();
    const updated = all.map(p => 
      ids.includes(p.id) 
        ? { ...p, status: 'archived' as const, isArchived: true } 
        : p
    );
    saveState(updated);
    return true;
  }
};
