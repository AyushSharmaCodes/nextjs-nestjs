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
  } catch (err) {
    console.error('Failed to parse products store, falling back to seed mock:', err);
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
    await delay(350); // Simulate network latency

    let filtered = loadState();

    // Apply Search
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower) ||
        p.slug.toLowerCase().includes(searchLower)
      );
    }

    // Apply Category Filter
    if (query?.category && query.category !== 'all') {
      const categoryLower = query.category.toLowerCase();
      filtered = filtered.filter(p => p.category.toLowerCase() === categoryLower);
    }

    // Apply Admin Status Filter
    if (query?.status && query.status !== 'all') {
      const statusLower = query.status.toLowerCase();
      filtered = filtered.filter(p => {
        if (statusLower === 'low-stock') {
          return p.stock > 0 && p.stock <= 10 && p.status !== 'archived';
        }
        if (statusLower === 'out-of-stock') {
          return p.stock === 0 && p.status !== 'archived';
        }
        return p.status === statusLower;
      });
    } else {
      // By default, do not show archived products unless explicitly requested
      if (query?.status !== 'archived') {
        filtered = filtered.filter(p => p.status !== 'archived');
      }
    }

    // Apply Sorting
    if (query?.sortBy) {
      switch (query.sortBy) {
        case 'price-low-high':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high-low':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          break;
        case 'featured':
        default:
          filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
      }
    }

    const total = filtered.length;

    // Apply Pagination
    if (query?.page && query?.limit) {
      const start = (query.page - 1) * query.limit;
      const end = start + query.limit;
      filtered = filtered.slice(start, end);
    }

    return {
      products: filtered,
      total,
    };
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    await delay(200);
    return loadState().filter(p => p.featured && p.status === 'active');
  },

  getProductById: async (id: string): Promise<ProductWithDetails | undefined> => {
    await delay(250);
    const product = loadState().find(p => p.id === id);
    if (!product) return undefined;
    return getProductWithDetails(product);
  },

  getProductFilters: async (): Promise<ShopFilters> => {
    await delay(150);
    // Dynamic categories can also be mapped, but we reuse seed categories
    return MOCK_SHOP_FILTERS;
  },

  getProductReviews: async (productId: string, category: string): Promise<Review[]> => {
    await delay(200);
    return getCategorySpecificReviews(productId, category);
  },

  createProductReview: async (productId: string, input: ReviewInput): Promise<Review> => {
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
