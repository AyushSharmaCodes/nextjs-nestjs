'use client';

import React, { Suspense } from 'react';
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-neutral-50 dark:bg-neutral-950 overflow-hidden select-none">
      {/* Editorial Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-800 dark:border-neutral-800 dark:border-t-white rounded-full animate-spin" />
          <p className="text-xs text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider mt-4">Initializing secure environment...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
