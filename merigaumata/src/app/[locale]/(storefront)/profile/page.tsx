import { setRequestLocale } from 'next-intl/server';
import { ProfileDashboardClient } from '@/features/profile/components/ProfileDashboardClient';

interface ProfilePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  
  // Set the locale for next-intl server-side layout processes
  setRequestLocale(locale);

  return <ProfileDashboardClient />;
}
