import React from 'react';
import { useTranslations } from 'next-intl';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { TermsCheckbox } from './TermsCheckbox';

interface ForgotPasswordFormProps {
  locale: string;
  email: string;
  setEmail: (val: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (val: boolean) => void;
  onBackClick: () => void;
  onError: (msg: string | null) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  locale,
  email,
  setEmail,
  acceptedTerms,
  setAcceptedTerms,
  onBackClick,
  onError,
}) => {
  const t = useTranslations('auth');

  const {
    loading,
    error,
    forgotPasswordSent,
    handleForgotPasswordSubmit,
  } = useForgotPassword(locale, acceptedTerms, email, setEmail);

  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
      <div className="text-center pb-2">
        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
          {t('resetYourPassword')}
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
          {t('resetYourPasswordDesc')}
        </p>
      </div>

      {!forgotPasswordSent ? (
        <>
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
            id="terms-forgot"
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
            {t('sendResetLink')}
          </button>
        </>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/20 dark:border-emerald-900/30 rounded-2xl text-center space-y-2">
          <span className="text-xl">✉️</span>
          <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
            {t('resetEmailSent')}
          </p>
        </div>
      )}

      <div className="pt-4 flex flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={onBackClick}
          className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors underline underline-offset-4"
        >
          {t('backToSignIn')}
        </button>
      </div>
    </form>
  );
};
