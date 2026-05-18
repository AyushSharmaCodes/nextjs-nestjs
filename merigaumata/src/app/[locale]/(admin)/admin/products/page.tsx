import { setRequestLocale } from 'next-intl/server';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ProductsPageLayout } from '@/features/products/components/admin/ProductsPageLayout';
import { productKeys } from '@/features/products/hooks/use-products';
import { productsService } from '@/features/products/services/products.service';

interface AdminProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminProductsPage({ params }: AdminProductsPageProps) {
  const { locale } = await params;
  
  // Set the locale for next-intl server-side layout processes
  setRequestLocale(locale);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
      },
    },
  });

  // Default query inputs matching ProductsPageLayout initial state
  const defaultQuery = {
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'featured' as const,
    page: 1,
    limit: 8,
  };

  // Prefetch initial catalog page server-side to eliminate content flashes
  await queryClient.prefetchQuery({
    queryKey: productKeys.list(defaultQuery),
    queryFn: () => productsService.getProducts(defaultQuery),
  });

  // Prefetch raw all products list to warm metrics analytics cards
  await queryClient.prefetchQuery({
    queryKey: productKeys.list({
      search: '',
      category: 'all',
      status: 'all',
      sortBy: 'featured' as const,
      page: 1,
      limit: 9999,
    }),
    queryFn: () => productsService.getProducts({
      search: '',
      category: 'all',
      status: 'all',
      sortBy: 'featured' as const,
      page: 1,
      limit: 9999,
    }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsPageLayout />
    </HydrationBoundary>
  );
}
