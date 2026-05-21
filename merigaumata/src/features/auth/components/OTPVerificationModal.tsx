'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppIcon, ActionIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading: boolean;
  isResendLoading: boolean;
  isNavigating?: boolean;
  otpType?: 'LOGIN' | 'EMAIL_VERIFICATION';
  error?: string | null;
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  email,
  onVerify,
  onResend,
  isLoading,
  isResendLoading,
  isNavigating = false,
  otpType = 'LOGIN',
  error
}: OTPVerificationModalProps) {
  const t = useTranslations('Auth');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (!isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(600);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (!isNaN(Number(char)) && i < 6) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            <ActionIcon
              name="close"
              onClick={onClose}
              disabled={isLoading}
              ariaLabel="Close modal"
              size="md"
              variant="muted"
              buttonClassName="absolute top-4 right-4 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            />

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-200 dark:border-primary-800">
                  <AppIcon name="lock" size="xl" variant="primary" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  Verify your email
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  We've sent a verification code to <br />
                  <span className="font-semibold text-neutral-900 dark:text-white">{email}</span>
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between mb-8" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={isLoading}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm text-center mb-4 font-semibold"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full h-12 bg-secondary-600 hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center shadow-md shadow-secondary-500/20"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <AppIcon name="loading" size="sm" className="animate-spin" />
                      {isNavigating ? 'Redirecting…' : 'Verifying…'}
                    </span>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                  {timeLeft > 0 ? (
                    <>Code expires in <span className="font-bold text-neutral-900 dark:text-white">{formatTime(timeLeft)}</span></>
                  ) : (
                    <span className="text-red-500 font-bold">Code expired</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={onResend}
                  disabled={timeLeft > 570 || isResendLoading} // 30 sec cooldown
                  className="mt-2 text-[13px] font-bold text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 disabled:opacity-50 transition-colors underline decoration-2 underline-offset-4"
                >
                  {isResendLoading ? 'Resending...' : 'Resend code'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
