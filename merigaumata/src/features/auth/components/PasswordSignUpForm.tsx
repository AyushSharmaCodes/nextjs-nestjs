import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { usePasswordSignUp } from '../hooks/usePasswordSignUp';
import { TermsCheckbox } from './TermsCheckbox';

interface PasswordSignUpFormProps {
  locale: string;
  email: string;
  setEmail: (val: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (val: boolean) => void;
  onError: (msg: string | null) => void;
}

export const PasswordSignUpForm: React.FC<PasswordSignUpFormProps> = ({
  locale,
  email,
  setEmail,
  acceptedTerms,
  setAcceptedTerms,
  onError,
}) => {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    handlePasswordSignUp,
    passwordRequirements,
    checkPasswordStrength,
  } = usePasswordSignUp(locale, acceptedTerms, email, setEmail);

  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  const strength = checkPasswordStrength(password);
  const isFormValid = 
    firstName && 
    lastName && 
    email && 
    password && 
    confirmPassword && 
    acceptedTerms && 
    strength === passwordRequirements.length &&
    password === confirmPassword;

  return (
    <form onSubmit={handlePasswordSignUp} className="space-y-4">
      <div className="flex gap-4">
        <div className="space-y-1.5 flex-1">
          <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">
            {t('firstName')}
          </label>
          <input 
            type="text" 
            required
            disabled={loading}
            placeholder={t('firstNamePlaceholder')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5 flex-1">
          <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">
            {t('lastName')}
          </label>
          <input 
            type="text" 
            required
            disabled={loading}
            placeholder={t('lastNamePlaceholder')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
          />
        </div>
      </div>

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
        <div className="flex justify-between items-center mr-1">
          <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">
            {t('passwordLabel')}
          </label>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">
            {t('passwordLabel')} {t('agreeTerms') ? 'Length' : 'Length'}: {password.length}
          </span>
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

        {/* Localized Password Strength Checklist */}
        {password.length > 0 && (
          <div className="mt-2 p-3.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/60 rounded-2xl space-y-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{t('passwordStrength')}</span>
              <span className="text-[10px] font-black text-secondary-500 uppercase tracking-wider">
                {strength} / {passwordRequirements.length}
              </span>
            </div>
            <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  strength === passwordRequirements.length ? 'bg-emerald-500' :
                  strength >= 3 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(strength / passwordRequirements.length) * 100}%` }}
              />
            </div>
            <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
              {passwordRequirements.map((req) => {
                const isMet = req.test(password);
                return (
                  <div key={req.id} className="flex items-center gap-1.5 text-[11px]">
                    <span className={`font-bold ${isMet ? 'text-emerald-500' : 'text-neutral-400'}`}>
                      {isMet ? '✓' : '○'}
                    </span>
                    <span className={isMet ? 'text-neutral-700 dark:text-neutral-300 font-medium' : 'text-neutral-450 dark:text-neutral-500'}>
                      {t(`validation.${req.id}`)}
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
          {t('agreeTerms') ? 'Confirm Password' : 'Confirm Password'}
        </label>
        <div className="relative">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
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

      <TermsCheckbox 
        id="terms-signup"
        checked={acceptedTerms}
        onChange={setAcceptedTerms}
        locale={locale}
      />

      <button 
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
        )}
        {t('createAccountBtn')}
      </button>
    </form>
  );
};
