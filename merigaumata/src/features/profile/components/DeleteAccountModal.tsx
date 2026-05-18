'use client';

import { useState } from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteAccountModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (val: boolean) => void;
}

export function DeleteAccountModal({
  showDeleteModal,
  setShowDeleteModal
}: DeleteAccountModalProps) {
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState("");

  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShowDeleteModal(false)}
      />
      <div className="relative w-full max-w-md bg-card rounded-[1.5rem] shadow-2xl flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
             <Trash2 className="w-5 h-5 text-red-500" /> Confirm Deletion
          </h3>
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-foreground transition-colors"
           >
            <X className="w-4 h-4" />
           </button>
        </div>
        
        <p className="text-[14px] leading-relaxed font-medium text-neutral-600 dark:text-neutral-400 mb-6">
          This action cannot be undone. This will permanently delete your account
          and remove your data from our servers.
        </p>

        <div className="space-y-5 mb-8">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground leading-snug block">
              To verify, type <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded select-all selection:bg-red-200 dark:selection:bg-red-900">delete my account</span> below:
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 text-foreground placeholder:text-neutral-400 transition-all font-medium"
              value={deleteConfirmationPhrase}
              onChange={(e) => setDeleteConfirmationPhrase(e.target.value)}
              placeholder="Type the phrase to confirm"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
             <label className="text-[13px] font-semibold text-foreground">Confirm Password</label>
             <input 
              type="password"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 text-foreground placeholder:text-neutral-400 transition-all font-medium"
              placeholder="Enter your password"
             />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="px-5 py-3 rounded-xl font-semibold text-[14px] text-neutral-600 hover:text-foreground hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
           >
             Cancel
           </button>
           <button 
            disabled={deleteConfirmationPhrase !== 'delete my account'}
            className={`px-5 py-3 rounded-xl font-bold text-[14px] text-white transition-all duration-200 ${deleteConfirmationPhrase === 'delete my account' ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)]' : 'bg-red-300 dark:bg-red-950/40 dark:text-red-800 cursor-not-allowed border border-red-200 dark:border-red-900/30'}`}
            onClick={() => {
              alert("Account deletion sequence initiated.");
              setShowDeleteModal(false);
            }}
           >
             Permanently Delete
           </button>
        </div>
      </div>
    </div>
  );
}
