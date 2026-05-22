import { setRequestLocale } from 'next-intl/server';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ManagerDashboardClient } from '@/features/manager/components/ManagerDashboardClient';
import { managerKeys } from '@/features/manager/hooks/managerKeys';
import { managerService } from '@/features/manager/services/manager.service';

interface ManagerPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ManagerPage({ params }: ManagerPageProps) {
  const { locale } = await params;
  
  // Set the locale for next-intl server-side layout processes
  setRequestLocale(locale);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  // Prefetch non-user-specific manager dashboard queries server-side in parallel.
  // The manager profile is user-specific and fetched client-side by useManager()
  // once the session is confirmed via useStrictAuth().
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: managerKeys.events(),
      queryFn: managerService.getEventsList,
    }),
    queryClient.prefetchQuery({
      queryKey: managerKeys.products(),
      queryFn: managerService.getProductsList,
    }),
    queryClient.prefetchQuery({
      queryKey: managerKeys.donations(),
      queryFn: managerService.getDonationsList,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ManagerDashboardClient />
    </HydrationBoundary>
  );
}
