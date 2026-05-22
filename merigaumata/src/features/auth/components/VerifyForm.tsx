'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useStrictAuth } from '@/features/auth/hooks/useStrictAuth';
import { authClient } from '@/lib/auth-client';
import { AppIcon } from '@/shared/icons';
import { motion } from 'motion/react';
import { toast } from '@/shared/lib/toast';
import { authLogger } from '@/shared/lib/logger';
import { useTranslations } from 'next-intl';
import type { Role } from '../types/auth.types';

// ─── Role → destination path ─────────────────────────────────────────────────
// Derives the post-auth destination from the role already in the session.
// No extra network call needed — role is in useStrictAuth().
function roleToPath(locale: string, role: Role): string {
  if (role === 'ADMIN')   return `/${locale}/admin`;
  if (role === 'MANAGER') return `/${locale}/manager`;
  return `/${locale}`;
}

// Validate a `?next=` redirect param: must be a relative path on the same
// origin and must not be an auth page (prevents open-redirect and loops).
function resolveNextParam(next: string | null, locale: string, role: Role): string {
  const fallback = roleToPath(locale, role);
  if (!next) return fallback;

  try {
    // Decode and ensure it's a relative path (no protocol/host)
    const decoded = decodeURIComponent(next);
    if (!decoded.startsWith('/') || decoded.includes('//') || decoded.includes('auth/')) {
      return fallback;
    }
    return decoded;
  } catch {
    return fallback;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VerifyForm() {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();
  const locale       = typeof params.locale === 'string' ? params.locale : 'en';
  const nextParam    = searchParams.get('next');
  const t            = useTranslations('auth');

  const { status, user, session, error, refetch } = useStrictAuth();

  const [otpCode,       setOtpCode]       = useState(['', '', '', '', '', '']);
  const [otpError,      setOtpError]      = useState<string | null>(null);
  const [verifyingOtp,  setVerifyingOtp]  = useState(false);
  const [resendingOtp,  setResendingOtp]  = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isSuccess,     setIsSuccess]     = useState(false);

  // Guard: only auto-send OTP once per mount
  const hasSentOtp = useRef(false);
  // Guard: only trigger redirect once
  const hasRedirected = useRef(false);

  // ── Auto-send 2FA OTP on mount when pending ─────────────────────────────
  useEffect(() => {
    if (status !== 'authenticated') return;
    const pending = user.twoFactorEnabled && !session.twoFactorVerified;
    if (pending && !hasSentOtp.current) {
      hasSentOtp.current = true;
      authLogger.info('VerifyForm: auto-dispatching 2FA OTP');
      authClient.twoFactor.sendOtp().catch((err) => {
        authLogger.error('VerifyForm: auto-send OTP failed', { error: err });
      });
    }
  }, [status, user, session]);

  // ── Auto-redirect once session is fully verified ─────────────────────────
  // Uses role from the session — no extra /api/auth/me call needed.
  useEffect(() => {
    if (status !== 'authenticated') return;
    const pending = user.twoFactorEnabled && !session.twoFactorVerified;
    if (pending || hasRedirected.current) return;

    hasRedirected.current = true;
    const destination = resolveNextParam(nextParam, locale, user.role);

    authLogger.info('VerifyForm: session verified, redirecting', { destination, role: user.role });
    router.replace(destination);
  }, [status, user, session, locale, nextParam, router]);

  // ── Redirect unauthenticated users back to login ─────────────────────────
  useEffect(() => {
    if (status !== 'unauthenticated' && status !== 'error') return;
    const timer = setTimeout(() => {
      router.replace(`/${locale}/auth/login`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [status, locale, router]);

  // ── OTP input handlers ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...otpCode];
    digits.forEach((d, i) => { next[i] = d; });
    setOtpCode(next);
    // Focus the next empty slot or the last one
    const focusIdx = Math.min(digits.length, 5);
    document.getElementById(`otp-${focusIdx}`)?.focus();
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setOtpError(t('enterFullCode'));
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await authClient.twoFactor.verifyOtp({ code: fullCode });

      if (res.error) {
        setOtpError(res.error.message || t('otpVerifyFailed'));
        setOtpCode(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
        return;
      }

      setIsSuccess(true);

      // Refetch session so useStrictAuth reflects twoFactorVerified=true,
      // which triggers the auto-redirect effect above.
      refetch();

      toast.success(t('signedInSuccess'), {
        description: t('welcomeBackName', {
          name: user?.firstName || user?.email || 'friend',
        }),
        duration: 3000,
      });

      // Fallback redirect in case the effect doesn't fire fast enough
      setTimeout(() => {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          const destination = resolveNextParam(nextParam, locale, user?.role ?? 'CUSTOMER');
          router.replace(destination);
        }
      }, 1000);

    } catch (err) {
      setOtpError(err instanceof Error ? err.message : t('otpVerifyFailed'));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    setOtpError(null);
    setResendSuccess(false);
    try {
      const res = await authClient.twoFactor.sendOtp();
      if (res.error) {
        setOtpError(res.error.message || t('resendFailed'));
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : t('resendFailed'));
    } finally {
      setResendingOtp(false);
    }
  };

  // ── Render: loading ──────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
        <h3 className="font-serif text-xl font-black mb-2">{t('connectingSanctuary')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light max-w-sm">
          {t('resolvingCredentials')}
        </p>
      </div>
    );
  }

  // ── Render: unauthenticated / error ──────────────────────────────────────
  if (status === 'error' || status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/40 text-red-500 rounded-full flex items-center justify-center mb-6 text-xl font-bold">
          ⚠️
        </div>
        <h3 className="font-serif text-xl font-black mb-2">{t('authFailedTitle')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light max-w-[280px]">
          {error?.message || t('sessionExpiredDesc')}
        </p>
      </div>
    );
  }

  const isTwoFactorPending = user.twoFactorEnabled && !session.twoFactorVerified;

  // ── Render: 2FA OTP form ─────────────────────────────────────────────────
  if (isTwoFactorPending) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/80 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-neutral-200/50 dark:border-white/10 overflow-hidden p-8 sm:p-10 text-center mx-auto"
      >
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AppIcon name="lock" size="lg" />
        </div>

        <h2 className="text-2xl font-serif font-black mb-2 tracking-tight">{t('securityCheckTitle')}</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[280px] mx-auto mb-8">
          {t('enterPasscodePrefix')}
          <span className="font-semibold text-foreground">{user.email}</span>
          {t('colon')}
        </p>

        <form onSubmit={submitOtp}>
          <div
            className="flex justify-between gap-2 max-w-[300px] mx-auto mb-6"
            onPaste={handleOtpPaste}
          >
            {otpCode.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={verifyingOtp || isSuccess}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-10 h-12 text-center text-xl font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {otpError && (
            <p className="text-xs text-red-500 font-semibold mb-4 text-center">{otpError}</p>
          )}
          {resendSuccess && (
            <p className="text-xs text-emerald-500 font-semibold mb-4 text-center">
              {t('newPasscodeDispatched')}
            </p>
          )}

          <button
            type="submit"
            disabled={verifyingOtp || isSuccess || otpCode.join('').length !== 6}
            className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {verifyingOtp ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                <span>{t('verifyingCodeStatus')}</span>
              </>
            ) : isSuccess ? (
              <span>{t('successRedirecting')}</span>
            ) : (
              <span>{t('verifyCompleteBtn')}</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-150 dark:border-white/5">
          <button
            type="button"
            disabled={resendingOtp || isSuccess}
            onClick={handleResendOtp}
            className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-foreground transition-colors underline underline-offset-4 disabled:opacity-50"
          >
            {resendingOtp ? t('resendingCodeStatus') : t('resendSecurityCodeBtn')}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Render: verified — redirect in progress ──────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 scale-125 animate-ping" />
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-full flex items-center justify-center text-white text-xl shadow-lg relative z-10 font-bold">
          ✓
        </div>
      </div>
      <h3 className="font-serif text-xl font-black mb-2">{t('accessGrantedTitle')}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light max-w-sm">
        {t('welcomeBackPrefix')}
        <span className="font-semibold text-foreground">
          {user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.email}
        </span>
        {t('preparingSanctuary')}
      </p>
    </div>
  );
}
