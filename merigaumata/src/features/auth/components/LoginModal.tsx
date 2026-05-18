'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLenis } from 'lenis/react';
import { useTranslations } from 'next-intl';
import { useLogin, Mode } from '../hooks/use-login';
import { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';
import { logError } from '@/shared/lib/errors';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

export function LoginModal({ isOpen, onClose, initialMode = 'login' }: LoginModalProps) {
  const {
    mode,
    setMode,
    showPassword,
    togglePasswordVisibility,
    toggleMode,
    loginForm,
    signupForm,
    loginMutation,
    signupMutation,
  } = useLogin(initialMode);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const t = useTranslations('auth');

  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Submit Handlers
  const onLoginSubmit = async (values: LoginFormValues) => {
    setStatusFeedback({ type: null, message: '' });
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        setStatusFeedback({ type: 'success', message: data.message });
        setTimeout(() => {
          onClose();
          redirectUser(data.user.role);
        }, 1200);
      },
      onError: (err) => {
        logError(err, { component: 'LoginModal', action: 'login', email: values.email });
        setStatusFeedback({ type: 'error', message: err.message || 'Login failed' });
      }
    });
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setStatusFeedback({ type: null, message: '' });
    signupMutation.mutate(values, {
      onSuccess: (data) => {
        setStatusFeedback({ type: 'success', message: data.message });
        setTimeout(() => {
          onClose();
          redirectUser(data.user.role);
        }, 1200);
      },
      onError: (err) => {
        logError(err, { component: 'LoginModal', action: 'signup', email: values.email });
        setStatusFeedback({ type: 'error', message: err.message || 'Registration failed' });
      }
    });
  };

  const redirectUser = (role: string) => {
    const currentLocale = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'en') : 'en';
    if (role === 'ADMIN') {
      window.location.assign(`/${currentLocale}/admin`);
    } else if (role === 'MANAGER') {
      window.location.assign(`/${currentLocale}/manager`);
    } else {
      window.location.assign(`/${currentLocale}/profile`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStatusFeedback({ type: null, message: '' });
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
    };
  }, [isOpen, initialMode, lenis, setMode]);

  const handleBack = () => {
    setStatusFeedback({ type: null, message: '' });
    if (mode === 'signup') {
      setMode('login');
    } else {
      onClose();
    }
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.55, bounce: 0 }}
            className="relative w-full max-w-[1100px] h-full max-h-[750px] min-h-[600px] bg-background text-foreground rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden isolate ring-1 ring-neutral-200/50 dark:ring-white/10 select-none"
          >
            {/* Left Side - Majestic Indian Farm Imagery */}
            <div className="hidden md:flex relative w-[45%] h-full p-4 shrink-0">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden group">
                <div className="absolute inset-[-5%] w-[110%] h-[110%] transition-transform duration-1000 group-hover:scale-103">
                  <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                      <motion.div
                        key="login-img"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1000&auto=format&fit=crop"
                          alt="Majestic Gir Cow"
                          fill
                          sizes="(max-width: 768px) 100vw, 45vw"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                          priority
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup-img"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000&auto=format&fit=crop"
                          alt="Vedic Organic Pastures"
                          fill
                          sizes="(max-width: 768px) 100vw, 45vw"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                          priority
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Premium Editorial Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-neutral-900/30 transition-colors duration-500" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem] pointer-events-none" />

                {/* Brand Logo & Title Overlay */}
                <div className="absolute top-8 left-8 text-white flex items-center gap-3">
                  <div className="w-9 h-9 relative rounded-full overflow-hidden border border-white/20 bg-white shadow-md flex-shrink-0 flex items-center justify-center">
                    <Image 
                      src="https://picsum.photos/seed/merigaumata/100/100" 
                      alt="MeriGauMata Logo" 
                      width={36}
                      height={36}
                      className="object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-serif font-black text-lg tracking-wider text-white">
                    MeriGauMata
                  </span>
                </div>

                {/* Editorial Promotion Card Overlay */}
                <div className="absolute bottom-8 left-8 right-8">
                  <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                      <motion.div 
                        key="login-text"
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -15, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="backdrop-blur-xl bg-black/20 border border-white/15 p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] text-stone-100"
                      >
                        <h2 className="text-xl font-serif font-bold text-white mb-2 tracking-wide uppercase">Restore connection.</h2>
                        <p className="text-stone-200/90 text-xs font-light leading-relaxed">
                          Pure Vedic nutrition and organic farm goodness, directly from our grazing Indian cow sanctuaries to your home.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="signup-text"
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -15, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="backdrop-blur-xl bg-black/20 border border-white/15 p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] text-stone-100"
                      >
                        <h2 className="text-xl font-serif font-bold text-white mb-2 tracking-wide uppercase">Support Gau Seva.</h2>
                        <p className="text-stone-200/90 text-xs font-light leading-relaxed">
                          Register your account to sponsor cow welfare initiatives, order premium Bilona Ghee, and earn dynamic MGM blessings points.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Side - Custom Form */}
            <div 
              ref={scrollRef} 
              data-lenis-prevent
              className="w-full md:w-[55%] relative px-6 py-12 sm:px-12 md:px-16 overflow-y-auto overscroll-contain flex flex-col justify-between bg-card text-card-foreground overflow-hidden"
            >
              {/* Majestic Success Overlay */}
              <AnimatePresence>
                {statusFeedback.type === 'success' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-neutral-900/98 dark:bg-neutral-950/98 z-[60] flex flex-col items-center justify-center p-8 text-center"
                  >
                    {/* Concentric pulsing rings for premium look */}
                    <div className="relative mb-6">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-emerald-500/20 scale-120"
                      />
                      <motion.div 
                        initial={{ scale: 0.3, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 150 }}
                        className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-full flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-500/30 relative z-10"
                      >
                        ✓
                      </motion.div>
                    </div>
                    <motion.h3 
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="font-serif text-2xl font-black text-white mb-2 tracking-wide"
                    >
                      Success!
                    </motion.h3>
                    <motion.p 
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="text-stone-300 text-xs max-w-[280px] leading-relaxed font-light"
                    >
                      {statusFeedback.message}
                    </motion.p>
                    
                    {/* Micro-loading progress line */}
                    <div className="w-24 h-1 bg-white/10 rounded-full mt-8 overflow-hidden relative">
                      <motion.div
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 1.2, ease: 'linear' }}
                        className="absolute inset-y-0 w-[50%] bg-emerald-400 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Back Action Trigger */}
              <button 
                onClick={handleBack}
                disabled={isPending}
                className="absolute top-6 left-6 sm:top-8 sm:left-8 text-neutral-400 hover:text-foreground transition-all z-10 p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/60 rounded-full active:scale-95 disabled:opacity-50"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={3} />
              </button>

              <div className="flex flex-col justify-center min-h-full w-full max-w-[400px] mx-auto mt-10 md:mt-4 relative z-10 pb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col"
                  >
                    {/* Header */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-serif font-black mb-2 tracking-tight">
                        {mode === 'login' ? t('signInTitle') : t('createAccountTitle')}
                      </h2>
                      
                      <div className="text-[13px] text-neutral-500 dark:text-neutral-400">
                        {mode === 'login' ? (
                          <>
                            {t('noAccount')}{' '}
                            <button 
                              type="button" 
                              onClick={() => { if (!isPending) { setMode('signup'); setStatusFeedback({ type: null, message: '' }); } }}
                              className="font-bold text-secondary-600 dark:text-secondary-400 hover:underline decoration-2 underline-offset-4 disabled:opacity-50"
                              disabled={isPending}
                            >
                              {t('createAccountBtn')}
                            </button>
                          </>
                        ) : (
                          <>
                            {t('hasAccount')}{' '}
                            <button 
                              type="button" 
                              onClick={() => { if (!isPending) { setMode('login'); setStatusFeedback({ type: null, message: '' }); } }}
                              className="font-bold text-secondary-600 dark:text-secondary-400 hover:underline decoration-2 underline-offset-4 disabled:opacity-50"
                              disabled={isPending}
                            >
                              {t('signInLink')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Error Alert banner */}
                    <AnimatePresence>
                      {statusFeedback.type === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 p-4 rounded-[1.25rem] text-[12px] text-red-600 dark:text-red-400 mb-6 flex items-start gap-3 shadow-sm font-semibold select-text"
                        >
                          <span className="text-[14px] shrink-0 select-none">⚠️</span>
                          <div className="flex-1 leading-relaxed">
                            {statusFeedback.message}
                          </div>
                          <button 
                            type="button"
                            onClick={() => setStatusFeedback({ type: null, message: '' })}
                            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors font-bold text-[10px] uppercase tracking-wider shrink-0 select-none"
                          >
                            Dismiss
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form Block */}
                    {mode === 'login' ? (
                      <form className="space-y-4.5" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">{t('emailLabel')}</label>
                          <input 
                            type="email" 
                            disabled={isPending}
                            placeholder={t('emailPlaceholder')}
                            {...loginForm.register('email')}
                            className="w-full px-4.5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
                          />
                          {loginForm.formState.errors.email?.message && (
                            <p className="text-xs text-red-500 ml-3 mt-1 font-semibold">
                              {t(loginForm.formState.errors.email.message as Parameters<typeof t>[0])}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between ml-1 pr-1">
                            <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400">{t('passwordLabel')}</label>
                          </div>
                          <div className="relative group">
                            <input 
                              type={showPassword ? 'text' : 'password'} 
                              disabled={isPending}
                              placeholder="••••••" 
                              {...loginForm.register('password')}
                              className="w-full px-4.5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all placeholder:text-neutral-400/80 pr-12 disabled:opacity-50"
                            />
                            <button 
                              type="button"
                              onClick={togglePasswordVisibility}
                              disabled={isPending}
                              className="absolute right-4.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground transition-colors disabled:opacity-50"
                            >
                              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                          {loginForm.formState.errors.password?.message && (
                            <p className="text-xs text-red-500 ml-3 mt-1 font-semibold">
                              {t(loginForm.formState.errors.password.message as Parameters<typeof t>[0])}
                            </p>
                          )}
                          
                          <div className="text-right pr-2 pt-0.5">
                            <button type="button" disabled={isPending} className="text-[11px] font-bold text-neutral-500 hover:text-foreground transition-colors underline decoration-1 underline-offset-2 disabled:opacity-50">
                              {t('forgotPassword')}
                            </button>
                          </div>
                        </div>

                        {/* Checkbox section */}
                        <div className="pl-1 pt-1 opacity-90 hover:opacity-100 transition-opacity">
                          <label className="flex items-center gap-3 cursor-pointer group w-max">
                            <div className="relative flex items-center justify-center w-4.5 h-4.5 shrink-0">
                              <input 
                                type="checkbox" 
                                defaultChecked 
                                disabled={isPending}
                                className="peer appearance-none w-4.5 h-4.5 border border-neutral-300 dark:border-neutral-700 rounded-[4px] bg-transparent checked:bg-foreground checked:border-foreground cursor-pointer transition-all disabled:opacity-50" 
                              />
                              <svg className="absolute w-2.5 h-2.5 text-background pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span className="text-[12.5px] text-neutral-500 dark:text-neutral-400 font-medium">
                              {t('keepMeLoggedIn')}
                            </span>
                          </label>
                        </div>

                        {/* Demo access guidelines */}
                        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-3.5 rounded-2xl text-[11px] text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5 leading-relaxed shadow-sm">
                          <span className="text-[14px]">💡</span>
                          <div>
                            <span className="font-bold text-foreground">{t('demoAccessTitle')}</span>
                            <br />
                            {t('demoAccessDesc')}
                          </div>
                        </div>

                        {/* Primary Auth CTA Action */}
                        <div className="pt-2.5">
                          <button 
                            type="submit"
                            disabled={isPending}
                            className="relative w-full overflow-hidden text-white py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-neutral-300/40 dark:shadow-none disabled:opacity-50 flex justify-center items-center gap-2"
                          >
                            {isPending && <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />}
                            {t('loginBtn')}
                          </button>
                        </div>

                        {/* Fine Divider Line */}
                        <div className="flex items-center gap-4 py-1.5 select-none">
                          <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                          <span className="text-[10px] font-black text-neutral-400 tracking-widest uppercase">or</span>
                          <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                        </div>

                        {/* Google Single Social Login Button */}
                        <button 
                          type="button" 
                          disabled={isPending}
                          className="w-full py-3.5 px-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-foreground text-[13px] font-semibold border border-neutral-200 dark:border-neutral-800 rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
                        >
                          <Image
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google Logo"
                            width={16}
                            height={16}
                            referrerPolicy="no-referrer"
                          />
                          {t('continueWithGoogle')}
                        </button>
                      </form>
                    ) : (
                      <form className="space-y-4.5" onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">{t('firstName')}</label>
                            <input 
                              type="text" 
                              disabled={isPending}
                              placeholder="John" 
                              {...signupForm.register('firstName')}
                              className="w-full px-4.5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
                            />
                            {signupForm.formState.errors.firstName?.message && (
                              <p className="text-[10px] text-red-500 ml-3 mt-1 font-semibold">
                                {t(signupForm.formState.errors.firstName.message as Parameters<typeof t>[0])}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">{t('lastName')}</label>
                            <input 
                              type="text" 
                              disabled={isPending}
                              placeholder="Doe" 
                              {...signupForm.register('lastName')}
                              className="w-full px-4.5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
                            />
                            {signupForm.formState.errors.lastName?.message && (
                              <p className="text-[10px] text-red-500 ml-3 mt-1 font-semibold">
                                {t(signupForm.formState.errors.lastName.message as Parameters<typeof t>[0])}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ml-1">{t('emailLabel')}</label>
                          <input 
                            type="email" 
                            disabled={isPending}
                            placeholder={t('emailPlaceholder')}
                            {...signupForm.register('email')}
                            className="w-full px-4.5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all placeholder:text-neutral-400/80 disabled:opacity-50"
                          />
                          {signupForm.formState.errors.email?.message && (
                            <p className="text-xs text-red-500 ml-3 mt-1 font-semibold">
                              {t(signupForm.formState.errors.email.message as Parameters<typeof t>[0])}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between ml-1 pr-1">
                            <label className="text-[11px] font-black tracking-wider uppercase text-neutral-500 dark:text-neutral-400">{t('passwordLabel')}</label>
                          </div>
                          <div className="relative group">
                            <input 
                              type={showPassword ? 'text' : 'password'} 
                              disabled={isPending}
                              placeholder="••••••" 
                              {...signupForm.register('password')}
                              className="w-full px-4.5 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[13.5px] rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all placeholder:text-neutral-400/80 pr-12 disabled:opacity-50"
                            />
                            <button 
                              type="button"
                              onClick={togglePasswordVisibility}
                              disabled={isPending}
                              className="absolute right-4.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground transition-colors disabled:opacity-50"
                            >
                              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                          {signupForm.formState.errors.password?.message && (
                            <p className="text-xs text-red-500 ml-3 mt-1 font-semibold">
                              {t(signupForm.formState.errors.password.message as Parameters<typeof t>[0])}
                            </p>
                          )}
                        </div>

                        {/* Checkbox section */}
                        <div className="pl-1 pt-1 opacity-90 hover:opacity-100 transition-opacity">
                          <label className="flex items-center gap-3 cursor-pointer group w-max">
                            <div className="relative flex items-center justify-center w-4.5 h-4.5 shrink-0">
                              <input 
                                type="checkbox" 
                                defaultChecked 
                                disabled={isPending}
                                className="peer appearance-none w-4.5 h-4.5 border border-neutral-300 dark:border-neutral-700 rounded-[4px] bg-transparent checked:bg-foreground checked:border-foreground cursor-pointer transition-all disabled:opacity-50" 
                              />
                              <svg className="absolute w-2.5 h-2.5 text-background pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span className="text-[12.5px] text-neutral-500 dark:text-neutral-400 font-medium">
                              {t('agreeTerms')}
                            </span>
                          </label>
                        </div>

                        {/* Primary Auth CTA Action */}
                        <div className="pt-2.5">
                          <button 
                            type="submit"
                            disabled={isPending}
                            className="relative w-full overflow-hidden text-white py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md bg-secondary-600 hover:bg-secondary-700 shadow-neutral-300/40 dark:shadow-none disabled:opacity-50 flex justify-center items-center gap-2"
                          >
                            {isPending && <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />}
                            {t('createAccountBtn')}
                          </button>
                        </div>

                        {/* Fine Divider Line */}
                        <div className="flex items-center gap-4 py-1.5 select-none">
                          <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                          <span className="text-[10px] font-black text-neutral-400 tracking-widest uppercase">or</span>
                          <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                        </div>

                        {/* Google Single Social Login Button */}
                        <button 
                          type="button" 
                          disabled={isPending}
                          className="w-full py-3.5 px-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-foreground text-[13px] font-semibold border border-neutral-200 dark:border-neutral-800 rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
                        >
                          <Image
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google Logo"
                            width={16}
                            height={16}
                            referrerPolicy="no-referrer"
                          />
                          {t('continueWithGoogle')}
                        </button>
                      </form>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
