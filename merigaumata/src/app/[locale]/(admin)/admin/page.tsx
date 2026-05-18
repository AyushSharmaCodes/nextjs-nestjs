import { setRequestLocale } from 'next-intl/server';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { AdminDashboardClient } from '@/features/admin/components/AdminDashboardClient';
import { adminKeys } from '@/features/admin/hooks/adminKeys';
import { adminService } from '@/features/admin/services/admin.service';

interface AdminPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
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

  // Prefetch admin managers list query server-side
  await queryClient.prefetchQuery({
    queryKey: adminKeys.managers(),
    queryFn: adminService.getManagersList,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardClient />
    </HydrationBoundary>
  );
}
