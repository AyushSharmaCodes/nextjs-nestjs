import React from 'react';

export function PermissionBadge({ permission, isGranted }: { permission: string; isGranted: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono border ${
        isGranted
          ? 'bg-primary-500/10 text-primary-600 border-primary-500/20'
          : 'bg-surface-alt text-muted border-surface-border'
      }`}
    >
      {permission}
    </span>
  );
}
