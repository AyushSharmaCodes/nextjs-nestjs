import React from 'react';
import { useTranslations } from 'next-intl';

interface TermsCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  locale: string;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ id, checked, onChange, locale }) => {
  const t = useTranslations('auth');

  return (
    <div className="flex items-start gap-2.5 py-1">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-secondary-500 focus:ring-secondary-500 cursor-pointer"
      />
      <label htmlFor={id} className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal select-none cursor-pointer">
        {t('acceptTermsPrefix')}{' '}
        <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          {t('termsAndConditions')}
        </a>{' '}
        {t('and')}{' '}
        <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          {t('privacyPolicy')}
        </a>.
      </label>
    </div>
  );
};
