'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppIcon } from '@/shared/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useVerify2FA } from '../hooks/useVerify2FA';

export default function VerifyForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const {
    status,
    user,
    session,
    otpCode,
    setOtpCode,
    backupCode,
    setBackupCode,
    isBackupMode,
    setIsBackupMode,
    otpError,
    setOtpError,
    verifyingOtp,
    isSuccess,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    submitOtp,
  } = useVerify2FA(locale);

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

  // ── Render: error ────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/40 text-red-500 rounded-full flex items-center justify-center mb-6 text-xl font-bold">
          ⚠️
        </div>
        <h3 className="font-serif text-xl font-black mb-2">{t('authFailedTitle')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light max-w-[280px]">
          {t('sessionExpiredDesc')}
        </p>
      </div>
    );
  }

  const isTwoFactorPending =
    status === 'unauthenticated' ||
    (status === 'authenticated' && user?.twoFactorEnabled && !session?.twoFactorVerified);

  // ── Render: 2FA TOTP Form ────────────────────────────────────────────────
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
        
        {isBackupMode ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[280px] mx-auto mb-8">
            {t('supplyBackupCodeDesc')}
          </p>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[280px] mx-auto mb-8">
            {t('totpVerificationDesc')}
          </p>
        )}

        <form 
          onSubmit={(e) => submitOtp(
            e,
            t('enterFullCode'),
            t('otpVerifyFailed'),
            t('signedInSuccess'),
            t('welcomeBackName', { name: user?.firstName || user?.email || 'friend' })
          )} 
          className="space-y-6"
        >
          {isBackupMode ? (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 text-left">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {t('recoveryBackupCodeLabel')}
              </label>
              <input
                type="text"
                required
                value={backupCode}
                onChange={e => setBackupCode(e.target.value.toUpperCase())}
                placeholder={t('recoveryBackupCodePlaceholder')}
                disabled={verifyingOtp || isSuccess}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-center font-mono font-bold text-base tracking-widest focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-440"
              />
            </div>
          ) : (
            <div
              className="flex justify-between gap-2 max-w-[300px] mx-auto animate-in fade-in duration-200"
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
          )}

          {otpError && (
            <p className="text-xs text-red-500 font-semibold text-center">{otpError}</p>
          )}

          <button
            type="submit"
            disabled={verifyingOtp || isSuccess || (!isBackupMode && otpCode.join('').length !== 6) || (isBackupMode && !backupCode)}
            className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm animate-in fade-in"
          >
            {verifyingOtp ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                <span>{t('verifyingCodeStatus')}</span>
              </>
            ) : isSuccess ? (
              <span>{t('successRedirecting')}</span>
            ) : (
              <span>{t('verifyAndContinueBtn')}</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-150 dark:border-white/5 flex flex-col gap-3 items-center">
          <button
            type="button"
            disabled={verifyingOtp || isSuccess}
            onClick={() => {
              setIsBackupMode(!isBackupMode);
              setOtpError(null);
              setOtpCode(['', '', '', '', '', '']);
              setBackupCode('');
            }}
            className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-foreground transition-colors underline underline-offset-4 disabled:opacity-50"
          >
            {isBackupMode ? t('useAuthenticatorCodeBtn') : t('useBackupCodeBtn')}
          </button>

          <button
            type="button"
            disabled={verifyingOtp || isSuccess}
            onClick={() => router.replace(`/${locale}/auth/login`)}
            className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-foreground transition-colors underline underline-offset-4 disabled:opacity-50"
          >
            {t('goToLogin')}
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
          {user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || user?.email}
        </span>
        {t('preparingSanctuary')}
      </p>
    </div>
  );
}
