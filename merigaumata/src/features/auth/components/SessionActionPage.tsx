'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientEnv } from '@/core/env/client';
import { AppIcon } from '@/shared/icons';

type SessionAction = 'confirm' | 'revoke';

interface SessionActionPageProps {
  action: SessionAction;
  locale: string;
  sessionId: string;
}

export default function SessionActionPage({
  action,
  locale,
  sessionId,
}: SessionActionPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const content = useMemo(() => {
    if (action === 'confirm') {
      return {
        title: 'Confirm this sign-in',
        description: 'Use this only if you recognize the device and location from the alert email.',
        cta: 'Yes, this was me',
      };
    }

    return {
      title: 'Revoke this session',
      description: 'Use this if the sign-in looked suspicious. The session will be expired immediately.',
      cta: 'Revoke this session',
    };
  }, [action]);

  const handleAction = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${clientEnv.NEXT_PUBLIC_API_URL}/auth/session/${action}/${sessionId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const payload = await response.json().catch(() => null);
      const message =
        payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
          ? payload.message
          : response.ok
            ? 'Request completed successfully.'
            : 'Unable to complete this request.';

      setResult({ success: response.ok, message });
    } catch {
      setResult({
        success: false,
        message: 'Unable to contact the server. Please sign in and retry from your profile security section.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black">
          <AppIcon name="lock" size="md" />
        </div>
        <h1 className="font-serif text-2xl font-black text-neutral-950 dark:text-white">
          {content.title}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {content.description}
        </p>
      </div>

      {result && (
        <div
          className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
            result.success
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAction}
          disabled={loading}
          className="w-full rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
        >
          {loading ? 'Working...' : content.cta}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/profile`)}
          className="w-full rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5"
        >
          Go to profile security
        </button>
      </div>
    </div>
  );
}
