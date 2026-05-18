'use client';

import { useTranslations } from 'next-intl';
import { useAdmin } from '../hooks/useAdmin';
import { AdminAnalytics } from './AdminAnalytics';
import { ManagerProvisioner } from './ManagerProvisioner';

export function AdminDashboardClient() {
  const t = useTranslations('manager');
  const tAdmin = useTranslations('admin');
  
  const {
    managers,
    activeTab,
    createManager,
    deleteManager
  } = useAdmin();

  const translateIfKey = (text: string) => {
    if (text && text.startsWith('MockData.')) {
      const key = text.replace('MockData.', 'mockData.');
      return t(key as Parameters<typeof t>[0]);
    }
    return text;
  };

  // The activeTab state is technically still here if we want to toggle manager view,
  // but ideally Next.js routes handle this. For now, we will render AdminAnalytics
  // as the default dashboard view, and optionally ManagerProvisioner if selected.
  // We remove the old layout wrappers since AdminLayout handles the shell now.

  return (
    <div className="w-full animate-in fade-in duration-300">
      {activeTab === 'analytics' || !activeTab ? (
        <AdminAnalytics />
      ) : (
        <ManagerProvisioner 
          managers={managers}
          createManager={createManager}
          deleteManager={deleteManager}
          translateIfKey={translateIfKey}
        />
      )}
    </div>
  );
}
