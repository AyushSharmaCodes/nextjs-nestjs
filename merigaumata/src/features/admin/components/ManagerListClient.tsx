'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AdminShell } from './ui/AdminShell';
import { DataTable } from './ui/DataTable';
import { SearchInput } from './ui/SearchInput';
import { DrawerPanel } from './ui/DrawerPanel';
import { StatusBadge } from './ui/StatusBadge';
import { Plus } from 'lucide-react';

interface ManagerRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  lastActive: string;
}

export function ManagerListClient() {
  const router = useRouter();
  const t = useTranslations('admin.managersList');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Mock data for UI layout structure
  const data: ManagerRow[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER', status: 'active', lastActive: '2026-05-21T10:00:00Z' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'MANAGER', status: 'suspended', lastActive: '2026-05-18T14:30:00Z' },
  ];

  const columns = [
    {
      key: 'name',
      header: t('columns.manager'),
      render: (row: ManagerRow) => (
        <div>
          <div className="font-medium text-foreground">{row.name}</div>
          <div className="text-sm text-muted">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      render: (row: ManagerRow) => <StatusBadge status={row.status} />,
    },
    {
      key: 'lastActive',
      header: t('columns.lastActive'),
      render: (row: ManagerRow) => (
        <span className="text-sm text-muted">{new Date(row.lastActive).toLocaleDateString()}</span>
      ),
    },
  ];

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    // submit API call here
    setDrawerOpen(false);
  };

  return (
    <AdminShell
      title={t('title')}
      actions={
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addManager')}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="w-full max-w-sm">
          <SearchInput
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          data={data}
          columns={columns}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => router.push(`/${locale}/admin/managers/${row.id}`)}
        />
      </div>

      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t('inviteTitle')}
      >
        <form onSubmit={handleCreateManager} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('emailLabel')}</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-surface-alt text-foreground focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="manager@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('firstNameLabel')}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-surface-border rounded-lg bg-surface-alt text-foreground focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('lastNameLabel')}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-surface-border rounded-lg bg-surface-alt text-foreground focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-surface-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 text-sm font-medium text-foreground border border-surface-border rounded-lg hover:bg-surface-hover"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              {t('sendInvite')}
            </button>
          </div>
        </form>
      </DrawerPanel>
    </AdminShell>
  );
}
