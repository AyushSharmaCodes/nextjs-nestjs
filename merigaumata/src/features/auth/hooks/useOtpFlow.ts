import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { otpSchema } from '../schemas/auth.schema';
import { normalizeError } from '@/shared/lib/errors/api-error';

export function useOtpFlow(
  locale: string,
  acceptedTerms: boolean,
  externalEmail?: string,
  externalSetEmail?: (val: string) => void,
) {
  const router = useRouter();
  const [localEmail, setLocalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const email = externalEmail !== undefined ? externalEmail : localEmail;
  const setEmail = externalSetEmail !== undefined ? externalSetEmail : setLocalEmail;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('termsRequired');
      return;
    }
    const validation = otpSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (res.error) {
        throw res.error;
      } else {
        setOtpSent(true);
        toast.success('Code sent!', { description: `6-digit code delivered to ${email}` });
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      setError(apiError.message);
      toast.error('Failed to send code', { description: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (res.error) {
        throw res.error;
      } else {
        setError(null);
        toast.success('New code sent!', {
          description: `Fresh 6-digit code delivered to ${email}`,
        });
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      setError(apiError.message);
      toast.error('Failed to resend code', { description: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setError('Please enter a full 6-digit code');
      return;
    }
    setVerifyingOtp(true);
    setError(null);
    try {
      const res = await authClient.signIn.emailOtp({
        email,
        otp: fullCode,
      });
      if (res.error) {
        throw res.error;
      } else {
        try {
          await authClient.twoFactor.enable({ password: '' });
        } catch {
          // Non-fatal: 2FA might already be enabled
        }
        toast.success('OTP verified!', { description: 'Completing sign-in…' });
        router.replace(`/${locale}/auth/verify`);
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      setError(apiError.message);
      setOtpCode(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
      toast.error('Verification failed', { description: apiError.message });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otpCode];
    pastedData.forEach((char, i) => {
      if (!isNaN(Number(char)) && i < 6) {
        newOtp[i] = char;
      }
    });
    setOtpCode(newOtp);
  };

  return {
    email,
    setEmail,
    loading,
    error,
    setError,
    otpSent,
    setOtpSent,
    otpCode,
    setOtpCode,
    verifyingOtp,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
  };
}
