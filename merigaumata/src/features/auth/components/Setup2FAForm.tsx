'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStrictAuth } from '@/features/auth/hooks/useStrictAuth';
import { authClient } from '@/lib/auth-client';
import { AppIcon } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from '@/shared/lib/toast';
import { authLogger } from '@/shared/lib/logger';
import { useTranslations } from 'next-intl';

export default function Setup2FAForm() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  const t = useTranslations('auth');
  const { status, user, error, refetch } = useStrictAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Securely redirect unauthenticated users back to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/auth/login`);
    }
  }, [status, locale, router]);

  // Check if the authenticated user has a password (credential provider)
  useEffect(() => {
    const checkAccounts = async () => {
      try {
        const { data: accounts, error } = await authClient.listAccounts();
        if (error) {
          authLogger.error('Error listing accounts', { error });
          setHasPassword(false);
        } else if (accounts) {
          const hasCred = accounts.some(acc => acc.providerId === 'credential');
          setHasPassword(hasCred);
        } else {
          setHasPassword(false);
        }
      } catch (err) {
        authLogger.error('Error listing accounts', { error: err });
        setHasPassword(false);
      } finally {
        setAccountsLoading(false);
      }
    };

    if (status === 'authenticated') {
      checkAccounts();
    }
  }, [status]);

  const handleEnableTwoFactor = async () => {
    // Block passwordless users (Magic Link / Google) from enabling 2FA without a password
    if (hasPassword === false) {
      toast.error(t('passwordRequiredTitle'), {
        description: t('passwordRequiredDesc'),
      });
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setBackupCodes([]);
    try {
      const res = await authClient.twoFactor.enable({ password: hasPassword ? password : '' });

      if (res.error) {
        setErrorMessage(res.error.message || t('enable2FAFailed'));
        toast.error(t('enable2FAFailed'), { description: res.error.message });
      } else {
        setSuccessMessage(t('enable2FASuccessDesc'));
        toast.success(t('enable2FASuccessTitle'), { description: t('enable2FASuccessDesc') });
        setPassword('');
        if (res.data?.backupCodes) {
          setBackupCodes(res.data.backupCodes);
        }
        refetch();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('enable2FAFailed');
      setErrorMessage(msg);
      toast.error(t('enable2FAFailed'), { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await authClient.twoFactor.disable({ password: hasPassword ? password : '' });

      if (res.error) {
        setErrorMessage(res.error.message || t('disable2FAFailed'));
        toast.error(t('disable2FAFailed'), { description: res.error.message });
      } else {
        setSuccessMessage(t('disable2FASuccessDesc'));
        toast.success(t('disable2FASuccessTitle'), { description: t('disable2FASuccessDesc') });
        setPassword('');
        refetch();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('disable2FAFailed');
      setErrorMessage(msg);
      toast.error(t('disable2FAFailed'), { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodesToClipboard = () => {
    if (backupCodes.length === 0) return;
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleBack = () => {
    router.push(`/${locale}/profile`);
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h3 className="font-serif text-lg font-black">{t('loadingAccountDetails')}</h3>
      </div>
    );
  }

  if (status === 'unauthenticated' || status === 'error' || !user) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
          ⚠️
        </div>
        <h3 className="font-serif text-lg font-black mb-2">{t('accessDenied')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('redirectingLogin')}</p>
      </div>
    );
  }

  const isEnabled = user.twoFactorEnabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-lg bg-white/80 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-neutral-200/50 dark:border-white/10 overflow-hidden p-8 sm:p-10 mx-auto"
    >
      {/* Navigation Back */}
      <button
        onClick={handleBack}
        type="button"
        className="absolute top-6 left-6 w-9 h-9 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/80 transition-all rounded-full active:scale-95 z-10"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="text-center mt-6 mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-200 dark:border-primary-800">
          <AppIcon name="lock" size="lg" />
        </div>
        <h2 className="text-2xl font-serif font-black tracking-tight">{t('twoFactorTitle')}</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[320px] mx-auto mt-2 leading-relaxed font-light">
          {t('twoFactorDesc')}
        </p>
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs mb-6 font-medium text-left flex items-start gap-3"
          >
            <span>⚠️</span>
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs mb-6 font-medium text-left flex items-start gap-3"
          >
            <span>✅</span>
            <div className="flex-1">{successMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Dashboard Panel */}
      <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-3xl p-6 mb-8 text-left">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-400">{t('currentStatus')}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
            isEnabled 
              ? 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
          }`}>
            {isEnabled ? t('protectedActive') : t('inactive')}
          </span>
        </div>

        <div className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 font-light">
          {isEnabled ? (
            <span>{t('profileFullySecurePrefix')}<span className="font-semibold text-foreground">{user.email}</span>{t('profileFullySecureSuffix')}</span>
          ) : (
            <span>{t('profileInsecureDesc')}</span>
          )}
        </div>
      </div>

      {/* Password Confirmation (Required for password-based accounts only) */}
      {!accountsLoading && hasPassword && (
        <div className="mb-6 text-left animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
            {t('confirmPasswordLabel')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-xs focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-450 dark:placeholder-neutral-550 font-sans"
          />
        </div>
      )}

      {!accountsLoading && !hasPassword && (
        <div className="mb-6 text-left bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl p-4 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <span>ℹ️</span>
          <div className="flex-1 font-light leading-relaxed">
            {t('passwordlessInfo')}
          </div>
        </div>
      )}

      {/* Toggle CTA Button */}
      <div>
        {isEnabled ? (
          <button
            onClick={handleDisableTwoFactor}
            disabled={loading}
            className="w-full text-white bg-red-600 hover:bg-red-700 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {t('deactivate2FA')}
          </button>
        ) : (
          <button
            onClick={handleEnableTwoFactor}
            disabled={loading}
            className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
            )}
            {t('activate2FA')}
          </button>
        )}
      </div>

      {/* Backup Codes Section (Only displays right after enabling 2FA) */}
      <AnimatePresence>
        {backupCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 pt-8 border-t border-neutral-150 dark:border-white/5 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold text-foreground">{t('emergencyBackupCodesTitle')}</h3>
              <button
                onClick={copyBackupCodesToClipboard}
                className="text-[10px] font-black uppercase tracking-wider text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 transition-colors"
              >
                {copiedIndex === -1 ? t('copiedAll') : t('copyAll')}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-4">
              {t('backupCodesDesc')}
            </p>
            <div className="grid grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-150 dark:border-neutral-800 font-mono text-[11px] tracking-wider text-center">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-2 border border-neutral-200/30 rounded-lg bg-white dark:bg-neutral-900 shadow-sm text-foreground">
                  {code}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
