import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { usePasswordSignIn } from '../hooks/usePasswordSignIn';
import { TermsCheckbox } from './TermsCheckbox';

interface PasswordSignInFormProps {
  locale: string;
  email: string;
  setEmail: (val: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (val: boolean) => void;
  onForgotPasswordClick: () => void;
  onMagicLinkClick: () => void;
  onOtpClick: () => void;
  onError: (msg: string | null) => void;
}

export const PasswordSignInForm: React.FC<PasswordSignInFormProps> = ({
  locale,
  email,
  setEmail,
  acceptedTerms,
  setAcceptedTerms,
  onForgotPasswordClick,
  onMagicLinkClick,
  onOtpClick,
  onError,
}) => {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);

  const {
    password,
    setPassword,
    loading,
    error,
    handlePasswordSignIn,
  } = usePasswordSignIn(locale, acceptedTerms, email, setEmail);

  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <form onSubmit={handlePasswordSignIn} className="space-y-4">
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

      <div className="space-y-1.5">
        <div className="flex justify-between items-center ml-1">
          <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            {t('passwordLabel')}
          </label>
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-[10px] font-bold text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors underline underline-offset-2"
          >
            {t('forgotPassword')}
          </button>
        </div>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
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
      </div>

      <TermsCheckbox 
        id="terms-password"
        checked={acceptedTerms}
        onChange={setAcceptedTerms}
        locale={locale}
      />

      <button 
        type="submit"
        disabled={loading || !email || !password || !acceptedTerms}
        className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
        )}
        {t('loginBtn')}
      </button>

      <div className="pt-4 flex flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={onMagicLinkClick}
          className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors underline underline-offset-4"
        >
          {t('loginViaMagicLink')}
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
