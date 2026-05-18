'use client';

import React, { useState } from 'react';
import { 
  Users, ShoppingBag, Calendar, Heart, UserPlus, 
  Trash2, DollarSign 
} from 'lucide-react';
import { ManagerAccount } from '../types/admin.types';

interface ManagerProvisionerProps {
  managers: ManagerAccount[];
  createManager: (data: { name: string; email: string; permissions: ManagerAccount['permissions'] }) => void;
  deleteManager: (id: string) => void;
  translateIfKey: (text: string) => string;
}

export function ManagerProvisioner({
  managers,
  createManager,
  deleteManager,
  translateIfKey
}: ManagerProvisionerProps) {
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    permissions: {
      events: true,
      products: true,
      welfare: false,
      donations: false
    }
  });

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManager.name || !newManager.email) {
      alert('Please fill out all manager details.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newManager.email)) {
      alert('Please provide a valid email address.');
      return;
    }

    createManager({
      name: newManager.name,
      email: newManager.email.toLowerCase(),
      permissions: { ...newManager.permissions }
    });

    // Reset Form
    setNewManager({
      name: '',
      email: '',
      permissions: {
        events: true,
        products: true,
        welfare: false,
        donations: false
      }
    });
  };

  const togglePermission = (key: keyof ManagerAccount['permissions']) => {
    setNewManager(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Provision Manager Accounts</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Setup secure manager profiles and toggle explicit resource access layers.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <form onSubmit={handleCreateManager} className="xl:col-span-5 space-y-5 p-6 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/40 h-max">
          <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Create New Manager</h3>
          
          <div className="space-y-1">
            <label className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300">Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Madhav Das" 
              value={newManager.name}
              onChange={e => setNewManager(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300">Manager Email</label>
            <input 
              type="email" 
              required 
              placeholder="e.g. manager@merigaumata.com" 
              value={newManager.email}
              onChange={e => setNewManager(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700" 
            />
          </div>

          {/* Checkbox Privileges */}
          <div className="space-y-3 pt-2">
            <label className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 block">Grant Operation Access</label>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => togglePermission('events')}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                  newManager.permissions.events
                    ? 'bg-amber-500/10 border-amber-300/30 text-amber-700 dark:text-amber-400'
                    : 'bg-card dark:bg-neutral-900 border-border text-neutral-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Manage Events Tab
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              </button>

              <button
                type="button"
                onClick={() => togglePermission('products')}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                  newManager.permissions.products
                    ? 'bg-blue-500/10 border-blue-300/30 text-blue-700 dark:text-blue-400'
                    : 'bg-card dark:bg-neutral-900 border-border text-neutral-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> Manage Products Tab
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              </button>

              <button
                type="button"
                onClick={() => togglePermission('welfare')}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                  newManager.permissions.welfare
                    ? 'bg-emerald-500/10 border-emerald-300/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-card dark:bg-neutral-900 border-border text-neutral-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" /> Cow Welfare Support
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              </button>

              <button
                type="button"
                onClick={() => togglePermission('donations')}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                  newManager.permissions.donations
                    ? 'bg-purple-500/10 border-purple-300/30 text-purple-700 dark:text-purple-400'
                    : 'bg-card dark:bg-neutral-900 border-border text-neutral-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Financials & Donations
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 rounded-xl bg-foreground text-background font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none"
          >
            <UserPlus className="w-4 h-4" /> Provision Account
          </button>
        </form>

        {/* Right Column: Manager Roster */}
        <div className="xl:col-span-7 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Active Managers Roster</h3>
          
          {managers.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-neutral-500">
              No manager profiles registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              {managers.map(manager => (
                <div key={manager.id} className="p-5 border border-border bg-card rounded-xl flex flex-col sm:flex-row justify-between gap-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-bold text-[16px] text-foreground leading-snug">{translateIfKey(manager.name)}</h4>
                      <span className="text-xs font-semibold text-neutral-500 font-mono">{manager.email}</span>
                    </div>

                    {/* Permission Pill Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {manager.permissions.events && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Events
                        </span>
                      )}
                      {manager.permissions.products && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          Products
                        </span>
                      )}
                      {manager.permissions.welfare && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Welfare
                        </span>
                      )}
                      {manager.permissions.donations && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          Financials
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end items-end gap-2">
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Registered: {manager.createdAt}</span>
                    
                    {manager.id !== 'default-mgr-1' && manager.email !== 'manager@merigaumata.com' && (
                      <button 
                        onClick={() => deleteManager(manager.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors mt-1 focus:outline-none"
                        title="Delete Manager"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
