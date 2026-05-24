'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AdminShell } from './ui/AdminShell';
import { PermissionMatrix, PermissionDefinition, PermissionGrant } from './PermissionMatrix';
import { StatusBadge } from './ui/StatusBadge';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { ArrowLeft, Save, Trash2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logger } from '@/shared/lib/logger';


export function ManagerDetailClient({ managerId }: { managerId: string }) {
  const router = useRouter();
  const t = useTranslations('admin.managerDetail');
  const [isRevokeDialogOpen, setRevokeDialogOpen] = useState(false);

  // Mock data for UI Layout
  const manager = {
    id: managerId,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active' as const,
  };

  const [grants, setGrants] = useState<PermissionGrant[]>([
    { permissionId: 'perm_1', isActive: true, expiresAt: null },
    { permissionId: 'perm_2', isActive: true, expiresAt: new Date(Date.now() + 86400000).toISOString() }, // Expires tomorrow
  ]);

  const definitions: PermissionDefinition[] = [
    { id: 'perm_1', slug: 'customers.read', module: 'customers', action: 'read', isDangerous: false },
    { id: 'perm_2', slug: 'customers.edit', module: 'customers', action: 'edit', isDangerous: false },
    { id: 'perm_3', slug: 'customers.delete', module: 'customers', action: 'delete', isDangerous: true },
    { id: 'perm_4', slug: 'orders.read', module: 'orders', action: 'read', isDangerous: false },
    { id: 'perm_5', slug: 'orders.edit', module: 'orders', action: 'edit', isDangerous: false },
  ];

  const handleToggle = (permId: string, currentState: boolean) => {
    if (currentState) {
      setGrants(prev => prev.filter(g => g.permissionId !== permId));
    } else {
      setGrants(prev => [...prev, { permissionId: permId, isActive: true, expiresAt: null }]);
    }
  };

  const handleSetExpiry = (permId: string) => {
    // In real app, open a date picker dialog
    const grant = grants.find(g => g.permissionId === permId);
    if (!grant) return;
    
    // Toggle expiry for mock UI demonstration
    const newExpiresAt = grant.expiresAt ? null : new Date(Date.now() + 86400000 * 7).toISOString(); // +7 days
    
    setGrants(prev => prev.map(g => g.permissionId === permId ? { ...g, expiresAt: newExpiresAt } : g));
  };

  return (
    <AdminShell
      title={t('title')}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-surface-border bg-surface text-foreground rounded-lg hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('back')}
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Save className="w-4 h-4" /> {t('saveChanges')}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        
        {/* Manager Header Info */}
        <div className="flex items-start justify-between p-6 rounded-xl bg-surface-alt border border-surface-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center text-2xl font-bold">
              {manager.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{manager.name}</h2>
              <p className="text-muted">{manager.email}</p>
              <div className="mt-2">
                <StatusBadge status={manager.status} />
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => setRevokeDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              {t('suspendManager')}
            </button>
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('accessControlTitle')}</h3>
          <p className="text-sm text-muted mb-6">
            {t('accessControlDesc')}
          </p>
          
          <PermissionMatrix
            definitions={definitions}
            grants={grants}
            onToggle={handleToggle}
            onSetExpiry={handleSetExpiry}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isRevokeDialogOpen}
        onClose={() => setRevokeDialogOpen(false)}
        onConfirm={() => logger.info('Manager Suspended')}
        title={t('suspendDialogTitle')}
        description={t('suspendDialogDesc', { name: manager.name })}
        confirmText={t('confirmSuspend')}
        isDangerous={true}
      />
    </AdminShell>
  );
}
