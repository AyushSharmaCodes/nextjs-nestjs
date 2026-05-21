'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStrictAuth } from '@/features/auth/hooks/useStrictAuth';
import { authClient } from '@/lib/auth-client';
import { AppIcon } from '@/shared/icons';
import { motion } from 'motion/react';
import { apiInstance } from '@/shared/lib/api/axios';
import { toast } from '@/shared/lib/toast';
import { authLogger } from '@/shared/lib/logger';
import { useTranslations } from 'next-intl';

export default function VerifyForm() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  const t = useTranslations('auth');

  const { status, user, session, error, refetch } = useStrictAuth();
  
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const hasSentOtp = useRef(false);

  // Automatically trigger OTP dispatch on mount when 2FA is pending
  useEffect(() => {
    if (status === 'authenticated') {
      const isTwoFactorPending = user.twoFactorEnabled && !session.twoFactorVerified;
      if (isTwoFactorPending && !hasSentOtp.current) {
        hasSentOtp.current = true;
        authLogger.info('User landed on verification page. Automatically dispatching OTP mail...');
        authClient.twoFactor.sendOtp().then((res) => {
          if (res?.error) {
            authLogger.error('Failed to auto-send initial OTP', { error: res.error.message });
          } else {
            authLogger.info('OTP mail dispatched successfully on page load.');
          }
        }).catch((err) => {
          authLogger.error('Failed to auto-send initial OTP', { error: err });
        });
      }
    }
  }, [status, user, session]);

  // Auto-redirect authenticated users once verified
  useEffect(() => {
    if (status === 'authenticated') {
      const isTwoFactorPending = user.twoFactorEnabled && !session.twoFactorVerified;
      if (!isTwoFactorPending) {
        const redirectUser = async () => {
          let targetPath = `/${locale}`;
          try {
            const meRes = await apiInstance.get<{ user: { roles: string[] } }>('/api/auth/me');
            const roles = meRes.data?.user?.roles || [];
            const primaryRole = roles[0];
            if (primaryRole === 'ADMIN') {
              targetPath = `/${locale}/admin`;
            } else if (primaryRole === 'MANAGER') {
              targetPath = `/${locale}/manager`;
            }
          } catch (err) {
            authLogger.error('Failed to resolve roles on auto-redirect', { error: err });
          }
          router.replace(targetPath);
        };
        const timer = setTimeout(redirectUser, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [status, user, session, locale, router]);

  // If unauthenticated or error, redirect back to login
  useEffect(() => {
    if (status === 'unauthenticated' || status === 'error') {
      const timer = setTimeout(() => {
        router.replace(`/${locale}/auth/login`);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status, locale, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otpCode];
    pastedData.forEach((char, i) => {
      if (!isNaN(Number(char)) && i < 6) {
        newOtp[i] = char;
      }
    });
    setOtpCode(newOtp);
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
      const res = await authClient.twoFactor.verifyOtp({
        code: fullCode,
      });

      if (res.error) {
        setOtpError(res.error.message || t('otpVerifyFailed'));
        setOtpCode(['', '', '', '', '', '']);
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      } else {
        setIsSuccess(true);
        refetch();

        let targetPath = `/${locale}`;
        try {
          const meRes = await apiInstance.get<{ user: { roles: string[] } }>('/api/auth/me');
          const roles = meRes.data?.user?.roles || [];
          const primaryRole = roles[0];
          if (primaryRole === 'ADMIN') {
            targetPath = `/${locale}/admin`;
          } else if (primaryRole === 'MANAGER') {
            targetPath = `/${locale}/manager`;
          }
        } catch (err) {
          authLogger.error('Failed to resolve roles on success', { error: err });
        }

        toast.success(t('signedInSuccess'), {
          description: t('welcomeBackName', { name: user?.firstName || user?.email || 'friend' }),
          duration: 4000,
        });
        setTimeout(() => router.replace(targetPath), 1200);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('otpVerifyFailed');
      setOtpError(msg);
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
      const msg = err instanceof Error ? err.message : t('resendFailed');
      setOtpError(msg);
    } finally {
      setResendingOtp(false);
    }
  };

  // State: Loading / Resolving Session
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

  // State: Auth Failures / Errors
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
          {t('enterPasscodePrefix')}<span className="font-semibold text-foreground">{user.email}</span>{t('colon')}
        </p>

        <form onSubmit={submitOtp}>
          <div className="flex justify-between gap-2 max-w-[300px] mx-auto mb-6" onPaste={handleOtpPaste}>
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
            <p className="text-xs text-emerald-500 font-semibold mb-4 text-center">{t('newPasscodeDispatched')}</p>
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

  // State: Authenticated & 2FA Cleared (Successful flow)
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 scale-120 animate-ping" />
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-full flex items-center justify-center text-white text-xl shadow-lg relative z-10 font-bold">
          ✓
        </div>
      </div>

      <h3 className="font-serif text-xl font-black mb-2">{t('accessGrantedTitle')}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light max-w-sm">
        {t('welcomeBackPrefix')}<span className="font-semibold text-foreground">{user.lastName ? `${user.firstName} ${user.lastName}` : (user.firstName || user.email)}</span>{t('preparingSanctuary')}
      </p>
    </div>
  );
}
