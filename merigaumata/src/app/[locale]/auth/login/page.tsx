'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { useGoogleSignIn } from '@/features/auth/hooks/useGoogleSignIn';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { PasswordSignInForm } from '@/features/auth/components/PasswordSignInForm';
import { PasswordSignUpForm } from '@/features/auth/components/PasswordSignUpForm';
import { MagicLinkForm } from '@/features/auth/components/MagicLinkForm';
import { OtpForm } from '@/features/auth/components/OtpForm';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function LoginPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signinMethod, setSigninMethod] = useState<'password' | 'magic-link' | 'email-otp' | 'forgot-password'>('password');

  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { handleGoogleSignIn, loading: googleLoading, error: googleError } = useGoogleSignIn(locale, acceptedTerms);

  const handleModeSwitch = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setErrorMsg(null);
    setAcceptedTerms(false);
    setSigninMethod('password');
  };

  React.useEffect(() => {
    if (googleError) {
      setErrorMsg(googleError);
    }
  }, [googleError]);

  return (
    <AuthLayout
      locale={locale}
      authMode={authMode}
      onModeSwitch={handleModeSwitch}
      errorMsg={errorMsg}
      onErrorDismiss={() => setErrorMsg(null)}
    >
      <AnimatePresence mode="wait">
        {authMode === 'signin' ? (
          <motion.div
            key="signin-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {signinMethod !== 'forgot-password' && (
              <>
                <GoogleSignInButton
                  onClick={handleGoogleSignIn}
                  loading={googleLoading}
                  disabled={!acceptedTerms}
                />

                <div className="flex items-center gap-4 py-1 select-none">
                  <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                  <span className="text-[9px] font-black text-neutral-400 tracking-widest uppercase">
                    {t('orSignInWith')}
                  </span>
                  <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </>
            )}

            {signinMethod === 'password' ? (
              <PasswordSignInForm
                locale={locale}
                email={email}
                setEmail={setEmail}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                onForgotPasswordClick={() => {
                  setSigninMethod('forgot-password');
                  setErrorMsg(null);
                }}
                onMagicLinkClick={() => {
                  setSigninMethod('magic-link');
                  setErrorMsg(null);
                }}
                onOtpClick={() => {
                  setSigninMethod('email-otp');
                  setErrorMsg(null);
                }}
                onError={setErrorMsg}
              />
            ) : signinMethod === 'magic-link' ? (
              <MagicLinkForm
                locale={locale}
                email={email}
                setEmail={setEmail}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                onPasswordClick={() => {
                  setSigninMethod('password');
                  setErrorMsg(null);
                }}
                onOtpClick={() => {
                  setSigninMethod('email-otp');
                  setErrorMsg(null);
                }}
                onError={setErrorMsg}
              />
            ) : signinMethod === 'email-otp' ? (
              <OtpForm
                locale={locale}
                email={email}
                setEmail={setEmail}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                onPasswordClick={() => {
                  setSigninMethod('password');
                  setErrorMsg(null);
                }}
                onMagicLinkClick={() => {
                  setSigninMethod('magic-link');
                  setErrorMsg(null);
                }}
                onError={setErrorMsg}
              />
            ) : (
              <ForgotPasswordForm
                locale={locale}
                email={email}
                setEmail={setEmail}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                onBackClick={() => {
                  setSigninMethod('password');
                  setErrorMsg(null);
                }}
                onError={setErrorMsg}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="signup-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              loading={googleLoading}
              disabled={!acceptedTerms}
            />

            <div className="flex items-center gap-4 py-1 select-none">
              <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-[9px] font-black text-neutral-400 tracking-widest uppercase">
                {t('orSignUpWithEmail')}
              </span>
              <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <PasswordSignUpForm
              locale={locale}
              email={email}
              setEmail={setEmail}
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
              onError={setErrorMsg}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
