'use client';

import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand={false}
      gap={8}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '500',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.07)',
        },
        duration: 4000,
      }}
    />
  );
}
