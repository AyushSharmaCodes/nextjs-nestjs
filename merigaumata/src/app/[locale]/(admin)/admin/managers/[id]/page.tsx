import React from 'react';
import { ManagerDetailClient } from '@/features/admin/components/ManagerDetailClient';

export default function ManagerDetailPage({ params }: { params: { id: string } }) {
  return <ManagerDetailClient managerId={params.id} />;
}
