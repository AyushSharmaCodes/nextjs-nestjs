import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';

interface AuthLayoutProps {
  locale: string;
  authMode: 'signin' | 'signup';
  onModeSwitch: (mode: 'signin' | 'signup') => void;
  errorMsg: string | null;
  onErrorDismiss: () => void;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  locale,
  authMode,
  onModeSwitch,
  errorMsg,
  onErrorDismiss,
  children,
}) => {
  const t = useTranslations('auth');

  // Helper to cleanly resolve API codes and frontend validation keys
  const resolveDisplayMessage = (msg: string): string => {
    if (msg.startsWith('AUTH_')) {
      return t(`errors.${msg}` as Parameters<typeof t>[0]);
    }

    const validationKeys = [
      'termsRequired', 'enterEmailAndPassword', 'fillAllFields',
      'passwordsMismatch', 'passwordComplexity', 'invalidEmail'
    ] as const;

    for (const key of validationKeys) {
      if (msg.startsWith(key)) {
        return t(`validation.${key}` as Parameters<typeof t>[0]);
      }
    }

    return msg;
  };

  return (
    <div className="min-h-screen w-full flex bg-neutral-50 dark:bg-neutral-950 text-foreground overflow-hidden select-none">

      {/* Left visual column - Cover Image */}
      <div className="hidden lg:block relative lg:w-[40%] xl:w-[45%] h-screen shrink-0">
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1000&auto=format&fit=crop"
            alt="Gir Cow"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-neutral-950/40" />

          {/* Logo overlay */}
          <div className="absolute top-10 left-10 text-white flex items-center gap-3">
            <div className="w-10 h-10 relative rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shadow-lg">
              <Image
                src="https://picsum.photos/seed/merigaumata/100/100"
                alt="MeriGauMata Logo"
                width={38}
                height={38}
                className="object-cover"
              />
            </div>
            <span className="font-serif font-black text-xl tracking-wider text-white">
              MeriGauMata
            </span>
          </div>

          {/* Slogan overlay */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="backdrop-blur-md bg-white/10 dark:bg-black/25 border border-white/10 p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-serif font-bold text-white mb-3 uppercase tracking-wider">
                {t('coverTitle')}
              </h3>
              <p className="text-stone-200/90 text-sm font-light leading-relaxed">
                {t('coverDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Console Column */}
      <div className="w-full lg:w-[60%] xl:w-[55%] h-screen overflow-y-auto flex flex-col justify-center px-6 py-12 sm:px-12 md:px-20 lg:px-24">
        <div className="w-full max-w-[420px] mx-auto flex flex-col">

          {/* Sign In vs Sign Up Main Tab switcher */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-8 justify-between items-end">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => onModeSwitch('signin')}
                className={`text-2xl font-serif font-bold transition-all relative ${authMode === 'signin' ? 'text-foreground font-black' : 'text-neutral-400 hover:text-foreground'
                  }`}
              >
                {t('signInLink')}
                {authMode === 'signin' && (
                  <motion.div
                    layoutId="activeModeUnderline"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => onModeSwitch('signup')}
                className={`text-2xl font-serif font-bold transition-all relative ${authMode === 'signup' ? 'text-foreground font-black' : 'text-neutral-400 hover:text-foreground'
                  }`}
              >
                {t('signUpLink')}
                {authMode === 'signup' && (
                  <motion.div
                    layoutId="activeModeUnderline"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Decorative Logo / Heading for Small Screens */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-8 h-8 relative rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white flex items-center justify-center">
              <Image
                src="https://picsum.photos/seed/merigaumata/100/100"
                alt="MeriGauMata Logo"
                width={30}
                height={30}
                className="object-cover"
              />
            </div>
            <span className="font-serif font-black text-lg tracking-wider">
              MeriGauMata
            </span>
          </div>

          {/* Interactive Error Display Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs mb-6 flex items-start gap-3 shadow-sm font-medium"
              >
                <span className="text-[14px]">⚠️</span>
                <div className="flex-1 leading-relaxed">
                  {resolveDisplayMessage(errorMsg)}
                </div>
                <button
                  onClick={onErrorDismiss}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-bold uppercase tracking-wider text-[10px]"
                >
                  {t('goBack')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render children subcomponents */}
          <div className="w-full">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};
