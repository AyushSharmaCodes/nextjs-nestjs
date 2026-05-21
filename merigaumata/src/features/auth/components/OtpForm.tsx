import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { AppIcon } from '@/shared/icons';
import { useOtpFlow } from '../hooks/useOtpFlow';
import { TermsCheckbox } from './TermsCheckbox';

interface OtpFormProps {
  locale: string;
  email: string;
  setEmail: (val: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (val: boolean) => void;
  onPasswordClick: () => void;
  onMagicLinkClick: () => void;
  onError: (msg: string | null) => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({
  locale,
  email,
  setEmail,
  acceptedTerms,
  setAcceptedTerms,
  onPasswordClick,
  onMagicLinkClick,
  onError,
}) => {
  const t = useTranslations('auth');

  const {
    loading,
    error,
    otpSent,
    setOtpSent,
    otpCode,
    verifyingOtp,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
  } = useOtpFlow(locale, acceptedTerms, email, setEmail);

  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  if (otpSent) {
    return (
      <motion.div
        key="otp-banner"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center text-center py-6"
      >
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AppIcon name="lock" size="lg" />
        </div>

        <h3 className="font-serif text-xl font-black mb-2 tracking-tight">{t('verifyYourEmail')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[280px] mx-auto mb-8">
          {t('enterOtpDesc', { email })}
        </p>

        <form onSubmit={handleVerifyOtp} className="w-full">
          <div className="flex justify-between gap-2 max-w-[300px] mx-auto mb-6" onPaste={handleOtpPaste}>
            {otpCode.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={verifyingOtp}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-10 h-12 text-center text-xl font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all disabled:opacity-50 animate-in fade-in"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verifyingOtp || otpCode.join('').length !== 6}
            className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {verifyingOtp ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                <span>{t('verifyingCode')}</span>
              </>
            ) : (
              <span>{t('verifyAndSignIn')}</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-150 dark:border-white/5 w-full flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleResendOtp}
            className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-foreground transition-colors underline underline-offset-4 disabled:opacity-50"
          >
            {loading ? t('resending') : t('resendCode')}
          </button>
          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-foreground transition-colors underline underline-offset-4"
          >
            {t('goBack')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">
          {t('emailLabel')}
        </label>
        <input 
          type="email" 
          required
          disabled={loading}
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
        />
      </div>

      <TermsCheckbox 
        id="terms-otp"
        checked={acceptedTerms}
        onChange={setAcceptedTerms}
        locale={locale}
      />

      <button 
        type="submit"
        disabled={loading || !email || !acceptedTerms}
        className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
        )}
        {t('sendVerificationCode')}
      </button>

      <div className="pt-4 flex flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={onPasswordClick}
          className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors underline underline-offset-4"
        >
          {t('loginWithPassword')}
        </button>
        <button
          type="button"
          onClick={onMagicLinkClick}
          className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors underline underline-offset-4"
        >
          {t('loginViaMagicLink')}
        </button>
      </div>
    </form>
  );
};
