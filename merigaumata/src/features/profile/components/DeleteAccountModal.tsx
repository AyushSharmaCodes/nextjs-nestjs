'use client';

import { useState } from 'react';
import { AppIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';

interface DeleteAccountModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (val: boolean) => void;
}

export function DeleteAccountModal({
  showDeleteModal,
  setShowDeleteModal
}: DeleteAccountModalProps) {
  const t = useTranslations('profile');
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState("");

  if (!showDeleteModal) return null;

  const phraseText = 'delete my account';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShowDeleteModal(false)}
      />
      <div className="relative w-full max-w-md bg-card rounded-[1.5rem] shadow-2xl flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
             <AppIcon name="trash" size="md" className="text-red-500" /> {t('dangerZone.confirmTitle')}
          </h3>
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-foreground transition-colors"
           >
            <AppIcon name="close" size="sm" />
           </button>
        </div>
        
        <p className="text-[14px] leading-relaxed font-medium text-neutral-600 dark:text-neutral-400 mb-6">
          {t('dangerZone.confirmDesc')}
        </p>

        <div className="space-y-5 mb-8">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground leading-snug block">
              {t('dangerZone.phraseLabel', { phrase: phraseText })}
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 text-foreground placeholder:text-neutral-400 transition-all font-medium"
              value={deleteConfirmationPhrase}
              onChange={(e) => setDeleteConfirmationPhrase(e.target.value)}
              placeholder={t('dangerZone.phrasePlaceholder')}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
             <label className="text-[13px] font-semibold text-foreground">{t('dangerZone.passwordLabel')}</label>
             <input 
              type="password"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 text-foreground placeholder:text-neutral-400 transition-all font-medium"
              placeholder={t('dangerZone.passwordPlaceholder')}
             />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="px-5 py-3 rounded-xl font-semibold text-[14px] text-neutral-600 hover:text-foreground hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
           >
             {t('cancel')}
           </button>
           <button 
            disabled={deleteConfirmationPhrase !== phraseText}
            className={`px-5 py-3 rounded-xl font-bold text-[14px] text-white transition-all duration-200 ${deleteConfirmationPhrase === phraseText ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)]' : 'bg-red-300 dark:bg-red-950/40 dark:text-red-800 cursor-not-allowed border border-red-200 dark:border-red-900/30'}`}
            onClick={() => {
              alert(t('dangerZone.alertInitiated'));
              setShowDeleteModal(false);
            }}
           >
             {t('dangerZone.permanentlyDelete')}
           </button>
        </div>
      </div>
    </div>
  );
}

