'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useStrictAuth } from '@/features/auth/hooks/useStrictAuth';
import { AppIcon } from '@/shared/icons';
import { toast } from '@/shared/lib/toast';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailChangeModal({ isOpen, onClose }: EmailChangeModalProps) {
  const t = useTranslations('profile');
  const authState = useStrictAuth();
  const params = useParams();
  const currentLocale = (params.locale as string) || 'en';

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const user = authState.status === 'authenticated' ? authState.user : null;
  const twoFactorEnabled = user?.twoFactorEnabled || false;

  useEffect(() => {
    if (!isOpen || authState.status !== 'authenticated') return;
    
    // Check if user has password credentials
    authClient.listAccounts().then(({ data, error }) => {
      if (error || !data) {
        setHasPassword(false);
        return;
      }
      setHasPassword(data.some(acc => acc.providerId === 'credential'));
    });
  }, [isOpen, authState.status]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Password Challenge (if credentials exist)
      if (hasPassword) {
        const signinRes = await authClient.signIn.email({
          email: user.email,
          password: currentPassword,
        });
        
        if (signinRes.error) {
          // If 2FA is enabled, a successful password sign-in will return a 2FA pending error,
          // which is expected. Any other error means the password is wrong.
          const isTwoFactorRedirect = signinRes.error.status === 403 || signinRes.error.message?.toLowerCase().includes('two factor');
          if (!isTwoFactorRedirect && signinRes.error.message?.toLowerCase().includes('credential')) {
            setErrorMsg(t('toasts.emailChangeIncorrectPassword'));
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. 2FA Challenge (if enabled)
      if (twoFactorEnabled) {
        if (!twoFactorCode) {
          setErrorMsg(t('toasts.emailChange2faRequired'));
          setIsLoading(false);
          return;
        }

        const verifyRes = await authClient.twoFactor.verifyOtp({
          code: twoFactorCode,
        });

        if (verifyRes.error) {
          setErrorMsg(verifyRes.error.message || t('toasts.emailChange2faInvalid'));
          setIsLoading(false);
          return;
        }
      }

      // 3. Trigger change email
      const callbackURL = `${window.location.origin}/${currentLocale}/profile?emailChange=success`;
      const res = await authClient.changeEmail({
        newEmail,
        callbackURL,
      });

      if (res?.error) {
        setErrorMsg(res.error.message || t('toasts.emailChangeFailed'));
      } else {
        toast.success(t('toasts.emailChangeVerifySuccess'), {
          description: t('toasts.emailChangeVerifySuccessDesc', { email: newEmail }),
        });
        setNewEmail('');
        setCurrentPassword('');
        setTwoFactorCode('');
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t('toasts.emailChangeFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-foreground transition-colors focus:outline-none"
        >
          <AppIcon name="close" size="md" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-primary-500/10 dark:bg-primary-500/15 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
            <AppIcon name="mail" size="lg" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{t('emailModal.title')}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            {t('emailModal.desc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* New Email Field */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">
              {t('emailModal.newEmail')}
            </label>
            <input
              type="email"
              required
              placeholder={t('emailModal.newEmailPlaceholder')}
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          {/* Current Password Field (Password Challenge) */}
          {hasPassword === true && (
            <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">
                {t('emailModal.confirmPassword')}
              </label>
              <input
                type="password"
                required
                placeholder={t('emailModal.confirmPasswordPlaceholder')}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
          )}

          {/* 2FA OTP Field (Two-Factor Challenge) */}
          {twoFactorEnabled && (
            <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">
                {t('emailModal.codeLabel')}
              </label>
              <input
                type="text"
                required
                placeholder={t('emailModal.codePlaceholder')}
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 tracking-wider text-center font-mono font-bold"
              />
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-500 text-xs font-semibold p-3 rounded-lg flex items-center gap-2">
              <AppIcon name="alert" size="xs" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors focus:outline-none disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !newEmail}
              className="px-4 py-2 text-sm font-bold bg-neutral-900 text-white dark:bg-white dark:text-black rounded-xl shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors focus:outline-none disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                  <span>{t('processing')}</span>
                </>
              ) : (
                <span>{t('emailModal.btn')}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

