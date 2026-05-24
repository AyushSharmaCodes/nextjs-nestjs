import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import { ProductQueryInput, ReviewInput } from '../schemas/products.schema';
import { AdminProductInput } from '../schemas/adminProducts.schema';
import { Product } from '../types/products.types';
import { logError } from '@/shared/lib/errors';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (query: ProductQueryInput & { status?: string }) => [...productKeys.lists(), query] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  filters: () => [...productKeys.all, 'filters'] as const,
  reviews: (productId: string) => [...productKeys.all, 'reviews', productId] as const,
};

export function useProducts(
  query: ProductQueryInput & { status?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => productsService.getProducts(query),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
    ...options,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => productsService.getFeaturedProducts(),
    staleTime: 30000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getProductById(id),
    enabled: !!id,
    staleTime: 10000,
  });
}

export function useProductFilters() {
  return useQuery({
    queryKey: productKeys.filters(),
    queryFn: () => productsService.getProductFilters(),
    staleTime: 60000,
  });
}

export function useProductReviews(productId: string, category: string) {
  return useQuery({
    queryKey: productKeys.reviews(productId),
    queryFn: () => productsService.getProductReviews(productId, category),
    enabled: !!productId && !!category,
    staleTime: 5000,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewInput) => 
      productsService.createProductReview(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.reviews(productId) });
    },
    onError: (error) => {
      logError(error, {
        feature: 'products',
        action: 'createReview',
        productId
      });
    }
  });
}

// ==========================================
// ADMIN DASHBOARD CRUD MUTATIONS
// ==========================================

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminProductInput) => productsService.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      logError(error, {
        feature: 'products',
        action: 'createProduct'
      });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) => 
      productsService.updateProduct(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      // Snapshot past states
      const previousProductsList = queryClient.getQueryData(productKeys.all);
      const previousProductDetail = queryClient.getQueryData(productKeys.detail(id));

      // Optimistically update lists cache
      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => { // ts-audit-ignore
        if (!old) return old;
        if (old.products && Array.isArray(old.products)) {
          return {
            ...old,
            products: old.products.map((p: any) => p.id === id ? { ...p, ...updates } : p) // ts-audit-ignore
          };
        }
        if (Array.isArray(old)) {
          return old.map((p: any) => p.id === id ? { ...p, ...updates } : p); // ts-audit-ignore
        }
        return old;
      });

      // Optimistically update detail cache
      if (previousProductDetail) {
        queryClient.setQueryData(productKeys.detail(id), (old: any) => { // ts-audit-ignore
          if (!old) return old;
          return { ...old, ...updates };
        });
      }

      return { previousProductsList, previousProductDetail, id };
    },
    onError: (error, variables, context) => {
      // Rollback on failure
      if (context?.previousProductsList) {
        queryClient.setQueriesData({ queryKey: productKeys.all }, context.previousProductsList);
      }
      if (context?.previousProductDetail && context?.id) {
        queryClient.setQueryData(productKeys.detail(context.id), context.previousProductDetail);
      }
      logError(error, {
        feature: 'products',
        action: 'updateProduct',
        id: context?.id
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      }
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });
      const previousProductsList = queryClient.getQueryData(productKeys.all);

      // Optimistically delete from lists
      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => { // ts-audit-ignore
        if (!old) return old;
        if (old.products && Array.isArray(old.products)) {
          return {
            ...old,
            products: old.products.filter((p: any) => p.id !== id) // ts-audit-ignore
          };
        }
        if (Array.isArray(old)) {
          return old.filter((p: any) => p.id !== id); // ts-audit-ignore
        }
        return old;
      });

      return { previousProductsList };
    },
    onError: (error, id, context) => {
      if (context?.previousProductsList) {
        queryClient.setQueriesData({ queryKey: productKeys.all }, context.previousProductsList);
      }
      logError(error, {
        feature: 'products',
        action: 'deleteProduct',
        id
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.duplicateProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error, id) => {
      logError(error, {
        feature: 'products',
        action: 'duplicateProduct',
        id
      });
    }
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.archiveProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });
      const previousProductsList = queryClient.getQueryData(productKeys.all);

      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => { // ts-audit-ignore
        if (!old) return old;
        if (old.products && Array.isArray(old.products)) {
          return {
            ...old,
            products: old.products.map((p: any) => p.id === id ? { ...p, status: 'archived', isArchived: true } : p) // ts-audit-ignore
          };
        }
        if (Array.isArray(old)) {
          return old.map((p: any) => p.id === id ? { ...p, status: 'archived', isArchived: true } : p); // ts-audit-ignore
        }
        return old;
      });

      return { previousProductsList };
    },
    onError: (error, id, context) => {
      if (context?.previousProductsList) {
        queryClient.setQueriesData({ queryKey: productKeys.all }, context.previousProductsList);
      }
      logError(error, {
        feature: 'products',
        action: 'archiveProduct',
        id
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => productsService.bulkDeleteProducts(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });
      const previousProductsList = queryClient.getQueryData(productKeys.all);

      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => { // ts-audit-ignore
        if (!old) return old;
        if (old.products && Array.isArray(old.products)) {
          return {
            ...old,
            products: old.products.filter((p: any) => !ids.includes(p.id)) // ts-audit-ignore
          };
        }
        if (Array.isArray(old)) {
          return old.filter((p: any) => !ids.includes(p.id)); // ts-audit-ignore
        }
        return old;
      });

      return { previousProductsList };
    },
    onError: (error, ids, context) => {
      if (context?.previousProductsList) {
        queryClient.setQueriesData({ queryKey: productKeys.all }, context.previousProductsList);
      }
      logError(error, {
        feature: 'products',
        action: 'bulkDeleteProducts',
        ids
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });
}

export function useBulkArchiveProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => productsService.bulkArchiveProducts(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });
      const previousProductsList = queryClient.getQueryData(productKeys.all);

      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => { // ts-audit-ignore
        if (!old) return old;
        if (old.products && Array.isArray(old.products)) {
          return {
            ...old,
            products: old.products.map((p: any) => ids.includes(p.id) ? { ...p, status: 'archived', isArchived: true } : p) // ts-audit-ignore
          };
        }
        if (Array.isArray(old)) {
          return old.map((p: any) => ids.includes(p.id) ? { ...p, status: 'archived', isArchived: true } : p); // ts-audit-ignore
        }
        return old;
      });

      return { previousProductsList };
    },
    onError: (error, ids, context) => {
      if (context?.previousProductsList) {
        queryClient.setQueriesData({ queryKey: productKeys.all }, context.previousProductsList);
      }
      logError(error, {
        feature: 'products',
        action: 'bulkArchiveProducts',
        ids
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });
}
