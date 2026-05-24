'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AppIcon } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useSetup2FA } from '../hooks/useSetup2FA';

export default function Setup2FAForm() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const {
    status,
    user,
    loading,
    errorMessage,
    successMessage,
    wizardStep,
    setWizardStep,
    disableStep,
    setDisableStep,
    password,
    setPassword,
    emailOtp,
    setEmailOtp,
    totpCode,
    setTotpCode,
    totpURI,
    backupCodes,
    copiedIndex,
    hasPassword,
    accountsLoading,
    resendCooldown,
    handleStartEnable,
    handleConfirmPasswordEnable,
    handleVerifyEmailOtpEnable,
    handleResendEmailOtp,
    handleVerifyTotpEnable,
    handleStartDisable,
    handleConfirmPasswordDisable,
    handleVerifyEmailOtpDisable,
    handleVerifyTotpDisable,
    copyBackupCodesToClipboard,
    handleFinishSetup,
    handleBack,
  } = useSetup2FA(locale);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h3 className="font-serif text-lg font-black">{t('loadingAccountDetails')}</h3>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
          ⚠️
        </div>
        <h3 className="font-serif text-lg font-black mb-2">{t('accessDenied')}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('redirectingLogin')}</p>
      </div>
    );
  }

  const isEnabled = user.twoFactorEnabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-lg bg-white/80 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-neutral-200/50 dark:border-white/10 overflow-hidden p-8 sm:p-10 mx-auto"
    >
      {/* Navigation Back */}
      <button
        onClick={handleBack}
        type="button"
        className="absolute top-6 left-6 w-9 h-9 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/80 transition-all rounded-full active:scale-95 z-10"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="text-center mt-6 mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-200 dark:border-primary-800">
          <AppIcon name="lock" size="lg" />
        </div>
        <h2 className="text-2xl font-serif font-black tracking-tight">{t('twoFactorTitle')}</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[320px] mx-auto mt-2 leading-relaxed font-light">
          {isEnabled
            ? t('twoFactorTotpDesc')
            : t('twoFactorTotpInactiveDesc')}
        </p>
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs mb-6 font-medium text-left flex items-start gap-3"
          >
            <span>⚠️</span>
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs mb-6 font-medium text-left flex items-start gap-3"
          >
            <span>✅</span>
            <div className="flex-1">{successMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIZARD RENDER */}
      <AnimatePresence mode="wait">
        {/* Step 0: Dashboard Status */}
        {wizardStep === 'status' && disableStep === 'status' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-3xl p-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-400">{t('currentStatus')}</span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    isEnabled
                      ? 'bg-purple-100 dark:bg-purple-950/40 border border-purple-200/30 text-purple-600 dark:text-purple-400'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {isEnabled ? t('statusActiveTotp') : t('inactive')}
                </span>
              </div>

              <div className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 font-light">
                {isEnabled ? (
                  <span>{t('totpProfileProtectedDesc')}</span>
                ) : (
                  <span>{t('profileInsecureDesc')}</span>
                )}
              </div>
            </div>

            {/* Toggle CTA Button */}
            <div>
              {isEnabled ? (
                <button
                  onClick={handleStartDisable}
                  disabled={loading || accountsLoading}
                  className="w-full text-white bg-red-600 hover:bg-red-700 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
                >
                  {loading && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {t('deactivate2FA')}
                </button>
              ) : (
                <button
                  onClick={handleStartEnable}
                  disabled={loading || accountsLoading}
                  className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {loading && (
                    <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                  )}
                  {t('enableAuthenticatorBtn')}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* --- ENABLE WIZARD STEPS --- */}

        {/* Step 1: Password Confirmation (Enable) */}
        {wizardStep === 'confirm-password' && (
          <motion.form
            key="confirm-password"
            onSubmit={handleConfirmPasswordEnable}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-base mb-1">{t('confirmPasswordTitle')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                {t('confirmPasswordSetupDesc')}
              </p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {t('confirmPasswordLabel')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-xs focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-450 dark:placeholder-neutral-550 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? t('confirmingPassword') : t('confirmPasswordBtn')}
            </button>
          </motion.form>
        )}

        {/* Step 2: Verify Email OTP (Enable) */}
        {wizardStep === 'enter-email-otp' && (
          <motion.form
            key="enter-email-otp"
            onSubmit={handleVerifyEmailOtpEnable}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-base mb-1">{t('verifyYourEmail')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                {t('enterEmailOtpSetupDesc', { email: user.email })}
              </p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {t('emailVerificationCodeLabel')}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                value={emailOtp}
                onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('otpPlaceholder')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || emailOtp.length !== 6}
              className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? t('verifying') : t('verifyCodeBtn')}
            </button>
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={handleResendEmailOtp}
                disabled={loading || resendCooldown > 0}
                className="text-xs text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-bold transition-all disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `${t('resendCode')} (${resendCooldown}s)`
                  : loading
                  ? t('resending')
                  : t('resendCode')}
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Scan QR Code (Enable) */}
        {wizardStep === 'scan-qr' && totpURI && (
          <motion.div
            key="scan-qr"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="text-left">
              <h3 className="font-semibold text-base mb-1">{t('scanQrCodeTitle')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                {t('scanQrCodeDesc')}
              </p>
            </div>

            <div className="flex justify-center bg-white border border-neutral-100 dark:border-neutral-800/60 rounded-[1.5rem] p-6 shadow-inner mx-auto max-w-[240px]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpURI)}`}
                alt="TOTP QR Code"
                className="w-[200px] h-[200px] rounded-lg"
              />
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-xs text-amber-600 dark:text-amber-400 font-medium text-left leading-relaxed">
              {t('scanQrCodeWarning')}
            </div>

            <button
              onClick={() => setWizardStep('enter-totp-code')}
              className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
            >
              {t('scannedCodeBtn')}
            </button>
          </motion.div>
        )}

        {/* Step 4: Verify TOTP Code (Enable) */}
        {wizardStep === 'enter-totp-code' && (
          <motion.form
            key="enter-totp-code"
            onSubmit={handleVerifyTotpEnable}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-base mb-1">{t('confirmAppRegTitle')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                {t('confirmAppRegDesc')}
              </p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {t('authenticatorCodeLabel')}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('otpPlaceholder')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-440"
              />
            </div>
            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? t('activating') : t('activateAuthenticatorBtn')}
            </button>
          </motion.form>
        )}

        {/* Step 5: Backup Codes (Enable Completion) */}
        {wizardStep === 'show-backup-codes' && backupCodes.length > 0 && (
          <motion.div
            key="show-backup-codes"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 text-left"
          >
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground font-serif">{t('emergencyBackupCodesTitle')}</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mt-1">
                {t('saveRecoveryCodesDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-150 dark:border-neutral-800 font-mono text-[11px] tracking-wider text-center">
              {backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="p-2 border border-neutral-250/20 rounded-lg bg-white dark:bg-neutral-900 shadow-sm text-foreground"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyBackupCodesToClipboard}
                className="flex-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/50 text-foreground py-3 rounded-full text-xs font-bold transition-all"
              >
                {copiedIndex === -1 ? t('copiedAll') : t('copyAll')}
              </button>
              <button
                onClick={handleFinishSetup}
                className="flex-1 text-white dark:text-black bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 py-3 rounded-full text-xs font-bold transition-all text-center"
              >
                {t('finished')}
              </button>
            </div>
          </motion.div>
        )}

        {/* --- DISABLE WIZARD STEPS --- */}

        {/* Step 1: Password Confirmation (Disable) */}
        {disableStep === 'confirm-password-disable' && (
          <motion.form
            key="confirm-password-disable"
            onSubmit={handleConfirmPasswordDisable}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-base mb-1">{t('confirmPasswordTitle')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                {t('confirmPasswordDisableDesc')}
              </p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {t('confirmPasswordLabel')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-xs focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-450 dark:placeholder-neutral-550 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full text-white bg-red-600 hover:bg-red-700 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
            >
              {loading ? t('confirmingPassword') : t('confirmPasswordBtn')}
            </button>
          </motion.form>
        )}

        {/* Step 2: Verify Email OTP (Disable) */}
        {disableStep === 'enter-email-otp-disable' && (
          <motion.form
            key="enter-email-otp-disable"
            onSubmit={handleVerifyEmailOtpDisable}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-base mb-1">{t('verifyYourEmail')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                {t('enterEmailOtpDisableDesc', { email: user.email })}
              </p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {t('emailVerificationCodeLabel')}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                value={emailOtp}
                onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('otpPlaceholder')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || emailOtp.length !== 6}
              className="w-full text-white bg-red-600 hover:bg-red-700 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
            >
              {loading ? t('verifying') : t('verifyCodeBtn')}
            </button>
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={handleResendEmailOtp}
                disabled={loading || resendCooldown > 0}
                className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-bold transition-all disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `${t('resendCode')} (${resendCooldown}s)`
                  : loading
                  ? t('resending')
                  : t('resendCode')}
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Verify TOTP Code (Disable) */}
        {disableStep === 'enter-totp-code-disable' && (
          <motion.form
            key="enter-totp-code-disable"
            onSubmit={handleVerifyTotpDisable}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-base mb-1">{t('confirmAuthenticatorPossessionTitle')}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                {t('confirmAuthenticatorPossessionDesc')}
              </p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {t('authenticatorCodeLabel')}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('otpPlaceholder')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-white/5 rounded-2xl text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-neutral-800 dark:text-neutral-200 placeholder-neutral-440"
              />
            </div>
            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full text-white bg-red-600 hover:bg-red-700 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
            >
              {loading ? t('disabling2FA') : t('disableAuthenticatorBtn')}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
