import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { NotificationConsole } from '@/features/notifications/components/NotificationConsole';

interface AdminNotificationsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminNotificationsPage({ params }: AdminNotificationsPageProps) {
  const { locale } = await params;
  
  // Set the locale for next-intl server-side layout processes
  setRequestLocale(locale);

  return (
    <div className="w-full text-left">
      <NotificationConsole />
    </div>
  );
}
