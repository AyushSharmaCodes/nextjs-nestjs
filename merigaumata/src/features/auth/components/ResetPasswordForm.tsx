'use client';

import React, { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { AppIcon } from '@/shared/icons';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from '@/shared/lib/toast';
import { resetPasswordSchema } from '../schemas/auth.schema';
import { normalizeError } from '@/shared/lib/errors/api-error';
import { useTranslations } from 'next-intl';

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const checkPasswordStrength = (password: string) => {
  return PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMsg(t('invalidResetToken'));
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg(t('termsRequiredError'));
      return;
    }

    const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    const strength = checkPasswordStrength(password);
    if (strength < PASSWORD_REQUIREMENTS.length) {
      setErrorMsg(t('passwordSecurityRequirements'));
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await authClient.$fetch<{ status: boolean }>('/reset-password', {
        method: 'POST',
        body: {
          newPassword: password,
          token: token,
        },
      });

      if (error) {
        throw error;
      } else {
        setSuccess(true);
        toast.success(t('toastPasswordResetSuccess'), { description: t('toastPasswordResetSuccessDesc') });
        setTimeout(() => {
          router.replace(`/${locale}/auth/login`);
        }, 2000);
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      setErrorMsg(apiError.message);
      toast.error(t('toastPasswordResetFailed'), { description: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-[420px] bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-center space-y-4">
        <div className="text-rose-500 text-3xl font-bold">⚠️</div>
        <h3 className="font-serif text-xl font-black text-neutral-900 dark:text-white">{t('invalidResetLinkTitle')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
          {t('invalidResetLinkDescription')}
        </p>
        <button
          onClick={() => router.replace(`/${locale}/auth/login`)}
          className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all shadow-md"
        >
          {t('goToLogin')}
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-[420px] bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mx-auto relative mb-2">
          <span className="text-2xl font-bold">✓</span>
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 scale-120 animate-ping" />
        </div>
        <h3 className="font-serif text-xl font-black text-neutral-900 dark:text-white">{t('passwordResetSuccessTitle')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
          {t('passwordResetSuccessDescription')}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[420px] bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center mb-4 transition-colors">
          <AppIcon name="lock" size="md" className="text-white dark:text-black" />
        </div>
        <h3 className="font-serif text-xl font-black text-neutral-900 dark:text-white uppercase tracking-wider">
          {t('resetPasswordTitle')}
        </h3>
        <p className="text-[10px] tracking-widest font-black text-neutral-400 dark:text-neutral-500 uppercase mt-1">
          {t('chooseSecurePassword')}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/30 dark:border-rose-900/30 rounded-2xl">
          <p className="text-xs text-rose-600 dark:text-rose-450 font-bold leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center mr-1">
            <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">
              {t('newPassword')}
            </label>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">
              {t('lengthLabel')} {password.length}
            </span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 pr-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-350 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Strength Checklist */}
          {password.length > 0 && (
            <div className="mt-2 p-3.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/60 rounded-2xl space-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{t('passwordStrength')}</span>
                <span className="text-[10px] font-black text-secondary-500 uppercase tracking-wider">
                  {checkPasswordStrength(password)} / {PASSWORD_REQUIREMENTS.length}
                </span>
              </div>
              <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${checkPasswordStrength(password) === PASSWORD_REQUIREMENTS.length ? 'bg-emerald-500' :
                      checkPasswordStrength(password) >= 3 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  style={{ width: `${(checkPasswordStrength(password) / PASSWORD_REQUIREMENTS.length) * 100}%` }}
                />
              </div>
              <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const isMet = req.test(password);
                  return (
                    <div key={req.id} className="flex items-center gap-1.5 text-[11px]">
                      <span className={`font-bold ${isMet ? 'text-emerald-500' : 'text-neutral-400'}`}>
                        {isMet ? '✓' : '○'}
                      </span>
                      <span className={isMet ? 'text-neutral-700 dark:text-neutral-300 font-medium' : 'text-neutral-450 dark:text-neutral-500'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">
            {t('confirmNewPassword')}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              disabled={loading}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3 pr-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-350 transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 py-1">
          <input
            id="terms-reset"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-secondary-500 focus:ring-secondary-500 cursor-pointer"
          />
          <label htmlFor="terms-reset" className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal select-none cursor-pointer">
            {t.rich('acceptTerms', {
              terms: (chunks) => <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">{chunks}</a>,
              privacy: (chunks) => <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">{chunks}</a>
            })}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword || !acceptedTerms}
          className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              {t('updatingPassword')}
            </>
          ) : (
            t('updatePassword')
          )}
        </button>
      </form>
    </motion.div>
  );
}
