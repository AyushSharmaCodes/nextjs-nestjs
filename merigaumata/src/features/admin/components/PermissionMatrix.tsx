'use client';

import React from 'react';
import { Clock } from 'lucide-react';

export interface PermissionDefinition {
  id: string;
  slug: string;
  module: string;
  action: 'read' | 'write' | 'edit' | 'delete' | 'custom';
  description?: string;
  isDangerous: boolean;
}

export interface PermissionGrant {
  permissionId: string;
  isActive: boolean;
  expiresAt: string | null;
}

interface PermissionMatrixProps {
  definitions: PermissionDefinition[];
  grants: PermissionGrant[];
  onToggle: (permissionId: string, currentState: boolean) => void;
  onSetExpiry: (permissionId: string) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({ definitions, grants, onToggle, onSetExpiry, readOnly = false }: PermissionMatrixProps) {
  // Group definitions by module
  const modules = Array.from(new Set(definitions.map((d) => d.module))).sort();
  const actions = ['read', 'write', 'edit', 'delete', 'custom'] as const;

  const getDef = (mod: string, act: string) => definitions.find((d) => d.module === mod && d.action === act);
  const getGrant = (permId: string) => grants.find((g) => g.permissionId === permId && g.isActive);

  return (
    <div className="overflow-x-auto w-full bg-surface border border-surface-border rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-alt border-b border-surface-border text-xs uppercase text-muted">
          <tr>
            <th className="px-6 py-4 font-medium">Module</th>
            {actions.map((act) => (
              <th key={act} className="px-6 py-4 font-medium text-center">{act}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {modules.map((mod) => (
            <tr key={mod} className="hover:bg-surface-hover transition-colors">
              <td className="px-6 py-4 font-medium text-foreground capitalize">{mod}</td>
              {actions.map((act) => {
                const def = getDef(mod, act);
                if (!def) return <td key={act} className="px-6 py-4 text-center text-muted">-</td>;

                const grant = getGrant(def.id);
                const isGranted = !!grant;
                const isTemporary = isGranted && !!grant.expiresAt;
                const isExpired = isTemporary && new Date(grant!.expiresAt!) < new Date();

                return (
                  <td key={act} className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isGranted}
                          disabled={readOnly}
                          onChange={() => onToggle(def.id, isGranted)}
                        />
                        <div className={`w-9 h-5 bg-surface-alt rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                          isGranted 
                            ? def.isDangerous 
                              ? 'bg-red-500' 
                              : 'bg-primary-500'
                            : ''
                        }`}></div>
                      </label>
                      
                      {isGranted && !readOnly && (
                        <button
                          onClick={() => onSetExpiry(def.id)}
                          className={`mt-1 p-1 rounded-full transition-colors ${
                            isTemporary 
                              ? isExpired ? 'text-red-500 bg-red-500/10' : 'text-yellow-500 bg-yellow-500/10'
                              : 'text-muted hover:text-foreground hover:bg-surface-hover'
                          }`}
                          title={isTemporary ? `Expires: ${new Date(grant!.expiresAt!).toLocaleString()}` : 'Set Expiry'}
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                      )}
                      {isGranted && readOnly && isTemporary && (
                        <span className="text-[10px] text-yellow-600 mt-1" title={new Date(grant!.expiresAt!).toLocaleString()}>
                          <Clock className="w-3 h-3 inline mr-0.5" /> Temp
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
