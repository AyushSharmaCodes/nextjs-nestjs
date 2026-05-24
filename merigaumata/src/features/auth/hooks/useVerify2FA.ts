import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStrictAuth } from './useStrictAuth';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { authLogger } from '@/shared/lib/logger';
import type { Role } from '../types/auth.types';

// ─── Role → destination path ─────────────────────────────────────────────────
function roleToPath(locale: string, role: Role): string {
  if (role === 'ADMIN')   return `/${locale}/admin`;
  if (role === 'MANAGER') return `/${locale}/manager`;
  return `/${locale}`;
}

// Validate a `?next=` redirect param
function resolveNextParam(next: string | null, locale: string, role: Role): string {
  const fallback = roleToPath(locale, role);
  if (!next) return fallback;

  try {
    const decoded = decodeURIComponent(next);
    if (!decoded.startsWith('/') || decoded.includes('//') || decoded.includes('auth/')) {
      return fallback;
    }
    return decoded;
  } catch {
    return fallback;
  }
}

export function useVerify2FA(locale: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

  const { status, user, session, error, refetch } = useStrictAuth();

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [backupCode, setBackupCode] = useState('');
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const hasRedirected = useRef(false);

  // ── Auto-redirect once session is fully verified ─────────────────────────
  useEffect(() => {
    if (status !== 'authenticated') return;
    const pending = user.twoFactorEnabled && !session.twoFactorVerified;
    if (pending || hasRedirected.current) return;

    hasRedirected.current = true;
    const destination = resolveNextParam(nextParam, locale, user.role);

    authLogger.info('VerifyForm: session verified, redirecting to: {destination} with role: {role}', {
      destination,
      role: user.role,
    });
    router.replace(destination);
  }, [status, user, session, locale, nextParam, router]);

  // ── Redirect on error back to login ─────────────────────────────────────
  useEffect(() => {
    if (status !== 'error') return;
    const timer = setTimeout(() => {
      router.replace(`/${locale}/auth/login`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [status, locale, router]);

  // ── OTP input handlers ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...otpCode];
    digits.forEach((d, i) => { next[i] = d; });
    setOtpCode(next);
    const focusIdx = Math.min(digits.length, 5);
    document.getElementById(`otp-${focusIdx}`)?.focus();
  };

  const submitOtp = async (e: React.FormEvent, enterFullCodeMsg: string, otpVerifyFailedMsg: string, signedInSuccessMsg: string, welcomeBackNameMsg: string) => {
    e.preventDefault();
    setOtpError(null);

    const codeToVerify = isBackupMode ? backupCode.trim() : otpCode.join('');
    if (!isBackupMode && codeToVerify.length !== 6) {
      setOtpError(enterFullCodeMsg);
      return;
    }
    if (isBackupMode && !codeToVerify) {
      setOtpError('Please enter a recovery backup code.');
      return;
    }

    setVerifyingOtp(true);

    try {
      const res = isBackupMode
        ? await authClient.twoFactor.verifyBackupCode({ code: codeToVerify })
        : await authClient.twoFactor.verifyTotp({ code: codeToVerify });

      if (res.error) {
        setOtpError(res.error.message || (isBackupMode ? 'Invalid recovery backup code.' : otpVerifyFailedMsg));
        if (!isBackupMode) {
          setOtpCode(['', '', '', '', '', '']);
          document.getElementById('otp-0')?.focus();
        } else {
          setBackupCode('');
        }
        return;
      }

      setIsSuccess(true);
      refetch();

      toast.success(signedInSuccessMsg, {
        description: welcomeBackNameMsg,
        duration: 3000,
      });

      setTimeout(() => {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          const destination = resolveNextParam(nextParam, locale, user?.role ?? 'CUSTOMER');
          router.replace(destination);
        }
      }, 1000);

    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : otpVerifyFailedMsg);
      authLogger.error('Verification failed: {error}', { error: String(err) });
    } finally {
      setVerifyingOtp(false);
    }
  };

  return {
    status,
    user,
    session,
    error,
    otpCode,
    setOtpCode,
    backupCode,
    setBackupCode,
    isBackupMode,
    setIsBackupMode,
    otpError,
    setOtpError,
    verifyingOtp,
    isSuccess,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    submitOtp,
  };
}
