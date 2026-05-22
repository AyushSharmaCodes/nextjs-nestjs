import React from 'react';

type Status = 'active' | 'suspended' | 'pending' | 'error';

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const styles = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    suspended: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    pending: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
