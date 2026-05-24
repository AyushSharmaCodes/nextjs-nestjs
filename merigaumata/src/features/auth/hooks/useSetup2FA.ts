import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStrictAuth } from './useStrictAuth';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { authLogger } from '@/shared/lib/logger';

export function useSetup2FA(locale: string) {
  const router = useRouter();
  const { status, user, refetch } = useStrictAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [wizardStep, setWizardStep] = useState<'status' | 'confirm-password' | 'enter-email-otp' | 'scan-qr' | 'enter-totp-code' | 'show-backup-codes'>('status');
  const [disableStep, setDisableStep] = useState<'status' | 'confirm-password-disable' | 'enter-email-otp-disable' | 'enter-totp-code-disable'>('status');

  const [password, setPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpURI, setTotpURI] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for email OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  // Securely redirect unauthenticated users back to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/auth/login`);
    }
  }, [status, locale, router]);

  // Check if the authenticated user has a password (credential provider)
  useEffect(() => {
    const checkAccounts = async () => {
      try {
        const { data: accounts, error } = await authClient.listAccounts();
        if (error) {
          authLogger.error('Error listing accounts: {error}', { error: String(error) });
          setHasPassword(false);
        } else if (accounts) {
          const hasCred = accounts.some(acc => acc.providerId === 'credential');
          setHasPassword(hasCred);
        } else {
          setHasPassword(false);
        }
      } catch (err: unknown) {
        authLogger.error('Error listing accounts: {error}', { error: String(err) });
        setHasPassword(false);
      } finally {
        setAccountsLoading(false);
      }
    };

    if (status === 'authenticated') {
      checkAccounts();
    }
  }, [status]);

  // --- Enable Flow Actions ---

  const handleStartEnable = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setEmailOtp('');
    setTotpCode('');
    if (hasPassword) {
      setWizardStep('confirm-password');
    } else {
      setLoading(true);
      try {
        const otpRes = await authClient.emailOtp.sendVerificationOtp({
          email: user?.email || '',
          type: 'email-verification',
        });
        if (otpRes.error) throw otpRes.error;
        toast.success('Verification code sent!', { description: 'Please check your email inbox.' });
        setWizardStep('enter-email-otp');
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to send verification code.');
        authLogger.error('Failed to send verification OTP: {error}', { error: String(err) });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmPasswordEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authClient.signIn.email({
        email: user?.email || '',
        password,
      });
      if (res.error) {
        const isTwoFactorRedirect = res.error.status === 403 || res.error.message?.toLowerCase().includes('two factor');
        if (!isTwoFactorRedirect) {
          throw res.error;
        }
      }
      const otpRes = await authClient.emailOtp.sendVerificationOtp({
        email: user?.email || '',
        type: 'email-verification',
      });
      if (otpRes.error) throw otpRes.error;
      toast.success('Password confirmed!', { description: 'A verification code has been sent to your email.' });
      setWizardStep('enter-email-otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect password. Please try again.');
      authLogger.error('Password challenge failed: {error}', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtpEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.length !== 6) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authClient.emailOtp.verifyEmail({
        email: user?.email || '',
        otp: emailOtp,
      });
      if (res.error) throw res.error;

      // Email verified! Generate TOTP secret and backup codes
      const enableRes = await authClient.twoFactor.enable({
        password: hasPassword ? password : '',
      });
      if (enableRes.error) throw enableRes.error;

      if (enableRes.data?.totpURI) {
        setTotpURI(enableRes.data.totpURI);
      }
      if (enableRes.data?.backupCodes) {
        setBackupCodes(enableRes.data.backupCodes);
      }
      toast.success('Email verified!', { description: 'Scan the QR code to set up your authenticator app.' });
      setWizardStep('scan-qr');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid code. Please try again.');
      authLogger.error('Email OTP verification failed: {error}', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const otpRes = await authClient.emailOtp.sendVerificationOtp({
        email: user?.email || '',
        type: 'email-verification',
      });
      if (otpRes.error) throw otpRes.error;
      toast.success('Verification code resent!', { description: 'Please check your email inbox.' });
      setResendCooldown(30); // 30s cooldown
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification code.');
      authLogger.error('Failed to resend verification OTP: {error}', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotpEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: totpCode,
      });
      if (res.error) throw res.error;

      setSuccessMessage('Authenticator App activated successfully!');
      toast.success('2FA Enabled!', { description: 'Your profile is now fully protected.' });
      setWizardStep('show-backup-codes');
      refetch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid authenticator code. Please try again.');
      authLogger.error('TOTP verification failed: {error}', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  // --- Disable Flow Actions ---

  const handleStartDisable = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setEmailOtp('');
    setTotpCode('');
    if (hasPassword) {
      setDisableStep('confirm-password-disable');
    } else {
      setLoading(true);
      try {
        const otpRes = await authClient.emailOtp.sendVerificationOtp({
          email: user?.email || '',
          type: 'email-verification',
        });
        if (otpRes.error) throw otpRes.error;
        toast.success('Verification code sent!', { description: 'Please check your email inbox.' });
        setDisableStep('enter-email-otp-disable');
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to send verification code.');
        authLogger.error('Failed to send verification OTP: {error}', { error: String(err) });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmPasswordDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authClient.signIn.email({
        email: user?.email || '',
        password,
      });
      if (res.error) {
        const isTwoFactorRedirect = res.error.status === 403 || res.error.message?.toLowerCase().includes('two factor');
        if (!isTwoFactorRedirect) {
          throw res.error;
        }
      }
      const otpRes = await authClient.emailOtp.sendVerificationOtp({
        email: user?.email || '',
        type: 'email-verification',
      });
      if (otpRes.error) throw otpRes.error;
      toast.success('Password confirmed!', { description: 'A verification code has been sent to your email.' });
      setDisableStep('enter-email-otp-disable');
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect password. Please try again.');
      authLogger.error('Password challenge failed: {error}', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtpDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.length !== 6) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authClient.emailOtp.verifyEmail({
        email: user?.email || '',
        otp: emailOtp,
      });
      if (res.error) throw res.error;
      toast.success('Email verified!', { description: 'Enter the current passcode from your authenticator app.' });
      setDisableStep('enter-totp-code-disable');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid code. Please try again.');
      authLogger.error('Email OTP verification failed: {error}', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotpDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Verify TOTP code first
      const verifyRes = await authClient.twoFactor.verifyTotp({
        code: totpCode,
      });
      if (verifyRes.error) throw verifyRes.error;

      // 2. Fully disable 2FA
      const res = await authClient.twoFactor.disable({
        password: hasPassword ? password : '',
      });
      if (res.error) throw res.error;

      setSuccessMessage('Two-Factor Authentication deactivated successfully.');
      toast.success('2FA Disabled', { description: 'Your profile has reverted to single-factor auth.' });
      setDisableStep('status');
      setWizardStep('status');
      refetch();
      router.push(`/${locale}/profile`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid authenticator code. Please try again.');
      authLogger.error('Deactivation failed: {error}', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  // Helper actions
  const copyBackupCodesToClipboard = () => {
    if (backupCodes.length === 0) return;
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFinishSetup = () => {
    router.push(`/${locale}/profile`);
  };

  const handleBack = () => {
    if (wizardStep !== 'status' && wizardStep !== 'show-backup-codes') {
      setWizardStep('status');
    } else if (disableStep !== 'status') {
      setDisableStep('status');
    } else {
      router.push(`/${locale}/profile`);
    }
  };

  return {
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
  };
}
