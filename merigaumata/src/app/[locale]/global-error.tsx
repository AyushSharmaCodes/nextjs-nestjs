'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/**
 * Premium Fallback global-error.tsx handler.
 * Next.js requires html and body tags inside global-error because it supersedes the active layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Reports critical app-wide rendering crashes directly to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 m-0">
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg">
          <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400 text-4xl border border-red-200/50">
            🚨
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">Critical Application Failure</h1>
          <p className="text-stone-500 dark:text-stone-400 mb-8 leading-relaxed text-sm">
            A critical system-level rendering error has occurred in the application. We have automatically registered the diagnostic telemetry and notified our reliability engineers.
          </p>
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-[#2E1F30] hover:bg-[#432d46] text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-widest text-xs cursor-pointer border-0"
          >
            Attempt Application Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
