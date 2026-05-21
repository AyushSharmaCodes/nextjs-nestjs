'use client';

import React from 'react';
import Setup2FAForm from '@/features/auth/components/Setup2FAForm';

export default function Setup2FAPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-neutral-50 dark:bg-neutral-950 overflow-hidden select-none">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />

      <Setup2FAForm />
    </div>
  );
}
