import { setRequestLocale } from 'next-intl/server';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ProfileDashboardClient } from '@/features/profile/components/ProfileDashboardClient';
import { profileKeys } from '@/features/profile/hooks/profileKeys';
import { profileService } from '@/features/profile/services/profile.service';

interface ProfilePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
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

  // Prefetch profile queries server-side in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: profileKeys.personal(),
      queryFn: profileService.getPersonalDetails,
    }),
    queryClient.prefetchQuery({
      queryKey: profileKeys.account(),
      queryFn: profileService.getAccountDetails,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileDashboardClient />
    </HydrationBoundary>
  );
}
