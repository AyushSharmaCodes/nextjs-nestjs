import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signupSchema, LoginFormValues, SignupFormValues } from '../schemas/auth.schema';
import { ApiErrorDetails, LoginInitData, OtpType, ResendOtpData, SignupInitData, VerifyOtpData } from '../types/auth.types';

export type Mode = 'login' | 'signup';

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details: ApiErrorDetails | null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function useLogin(initialMode: Mode = 'login') {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMode(initialMode);
    });
  }, [initialMode]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleMode = () => setMode((prev) => (prev === 'login' ? 'signup' : 'login'));

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const [otpType, setOtpType] = useState<OtpType>('LOGIN');

  const loginMutation = useMutation<LoginInitData, ApiError, LoginFormValues>({
    mutationFn: async (data: LoginFormValues) => {
      const res = await (await import('../actions/auth.actions')).loginAction(data);
      if (!res.success) {
        throw new ApiError(res.error || 'BAD_REQUEST', res.message || 'Login failed', res.details);
      }
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data?.requiresOtp) {
        setIsOtpStep(true);
        setEmailForOtp(variables.email);
        setOtpType('LOGIN');
      }
    }
  });

  const signupMutation = useMutation<SignupInitData, ApiError, SignupFormValues>({
    mutationFn: async (data: SignupFormValues) => {
      const res = await (await import('../actions/auth.actions')).signupAction(data);
      if (!res.success) {
        throw new ApiError(res.error || 'BAD_REQUEST', res.message || 'Signup failed', res.details);
      }
      return res.data;
    },
    onSuccess: (data, variables) => {
      setIsOtpStep(true);
      setEmailForOtp(variables.email);
      setOtpType('EMAIL_VERIFICATION');
    }
  });

  const otpMutation = useMutation<VerifyOtpData, ApiError, string>({
    mutationFn: async (otp: string) => {
      const res = await (await import('../actions/auth.actions')).verifyOtpAction(emailForOtp, otp, otpType);
      if (!res.success) {
        throw new ApiError(res.error || 'BAD_REQUEST', res.message || 'Verification failed', res.details);
      }
      return res.data;
    },
    onSuccess: (data) => {
      setIsOtpStep(false);
      setEmailForOtp('');
    }
  });

  const resendOtpMutation = useMutation<ResendOtpData, ApiError, string>({
    mutationFn: async (email: string) => {
      const res = await (await import('../actions/auth.actions')).resendOtpAction(email);
      if (!res.success) {
        throw new ApiError(res.error || 'BAD_REQUEST', res.message || 'Failed to resend OTP', res.details);
      }
      return res.data;
    },
  });

  return {
    mode,
    setMode,
    showPassword,
    togglePasswordVisibility,
    toggleMode,
    loginForm,
    signupForm,
    loginMutation,
    signupMutation,
    otpMutation,
    isOtpStep,
    setIsOtpStep,
    emailForOtp,
    resendOtpMutation,
  };
}
