'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ManagerAccount } from '../types/admin.types';
import { adminService } from '../services/admin.service';
import { adminKeys } from './adminKeys';

export type AdminTab = 'analytics' | 'managers';

export function useAdmin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Queries
  const { data: managers = [] } = useQuery<ManagerAccount[]>({
    queryKey: adminKeys.managers(),
    queryFn: adminService.getManagersList,
    staleTime: 5 * 60 * 1000,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mutations
  const createManagerMutation = useMutation({
    mutationFn: async (account: Omit<ManagerAccount, 'id' | 'createdAt'>) => {
      const newAccount: ManagerAccount = {
        ...account,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toLocaleDateString('en-US'),
      };
      const updated = [...managers, newAccount];
      await adminService.saveManagersList(updated);
      return { updated, name: newAccount.name };
    },
    onSuccess: ({ updated, name }) => {
      queryClient.setQueryData(adminKeys.managers(), updated);
      showToast(`Successfully created manager account for ${name}!`);
    },
  });

  const deleteManagerMutation = useMutation({
    mutationFn: async (id: string) => {
      const updated = managers.filter((m) => m.id !== id);
      await adminService.saveManagersList(updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(adminKeys.managers(), updated);
      showToast('Manager account successfully removed.');
    },
  });

  return {
    managers,
    activeTab,
    setActiveTab,
    toastMessage,
    createManager: (account: Omit<ManagerAccount, 'id' | 'createdAt'>) => createManagerMutation.mutate(account),
    deleteManager: (id: string) => deleteManagerMutation.mutate(id),
  };
}
