import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { useMagicLink } from '../hooks/useMagicLink';
import { TermsCheckbox } from './TermsCheckbox';

interface MagicLinkFormProps {
  locale: string;
  email: string;
  setEmail: (val: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (val: boolean) => void;
  onPasswordClick: () => void;
  onOtpClick: () => void;
  onError: (msg: string | null) => void;
}

export const MagicLinkForm: React.FC<MagicLinkFormProps> = ({
  locale,
  email,
  setEmail,
  acceptedTerms,
  setAcceptedTerms,
  onPasswordClick,
  onOtpClick,
  onError,
}) => {
  const t = useTranslations('auth');

  const {
    loading,
    error,
    magicLinkSent,
    setMagicLinkSent,
    handleMagicLinkSubmit,
  } = useMagicLink(locale, acceptedTerms, email, setEmail);

  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  if (magicLinkSent) {
    return (
      <motion.div
        key="success-banner"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center text-center py-6"
      >
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 mb-5 relative">
          <span className="text-2xl font-bold">✓</span>
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute inset-0 rounded-full bg-emerald-500/10 scale-120"
          />
        </div>
        <h3 className="font-serif text-xl font-black mb-3">{t('checkYourInbox')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[280px] mb-6">
          {t('magicLinkSentDesc', { email })}
        </p>
        <button 
          onClick={() => setMagicLinkSent(false)}
          className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-foreground transition-colors underline underline-offset-4"
        >
          {t('goBack')}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
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
        id="terms-magic"
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
        {t('sendMagicLink')}
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
          onClick={onOtpClick}
          className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors underline underline-offset-4"
        >
          {t('loginViaOtp')}
        </button>
      </div>
    </form>
  );
};
