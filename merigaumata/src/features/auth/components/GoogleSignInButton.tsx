import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface GoogleSignInButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onClick, loading, disabled }) => {
  const t = useTranslations('auth');

  return (
    <button 
      type="button" 
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full py-3 px-4 bg-white dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground text-[13px] font-semibold border border-neutral-200 dark:border-neutral-700/80 rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
    >
      <Image
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google Logo"
        width={17}
        height={17}
      />
      {t('continueWithGoogle')}
    </button>
  );
};
