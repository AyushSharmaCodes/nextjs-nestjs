import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { loginSchema } from '../schemas/auth.schema';
import { normalizeError } from '@/shared/lib/errors/api-error';
import type { Role } from '../types/auth.types';

export function usePasswordSignIn(
  locale: string,
  acceptedTerms: boolean,
  externalEmail?: string,
  externalSetEmail?: (val: string) => void,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localEmail, setLocalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = externalEmail !== undefined ? externalEmail : localEmail;
  const setEmail = externalSetEmail !== undefined ? externalSetEmail : setLocalEmail;

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('termsRequired');
      return;
    }
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });
      if (res.error) {
        throw res.error;
      } else {
        const next = searchParams.get('next');
        const isTwoFactorRequired = !res.data || (res.data as Record<string, unknown>).twoFactorRedirect === true;

        if (isTwoFactorRequired) {
          toast.info('Two-Factor Authentication required', {
            description: 'Please enter your verification code to continue.',
          });
          const verifyPath = `/${locale}/auth/verify${next ? `?next=${encodeURIComponent(next)}` : ''}`;
          router.replace(verifyPath);
        } else {
          toast.success('Successfully signed in!', { description: 'Welcome back!' });

          // Directly redirect to destination based on user role (avoiding /auth/verify detour)
          const rawUser = res.data?.user as Record<string, unknown> | undefined;
          const userRole = (rawUser?.role as string | undefined)?.toUpperCase() ?? 'CUSTOMER';
          
          let destination = `/${locale}`;
          if (userRole === 'ADMIN') {
            destination = `/${locale}/admin`;
          } else if (userRole === 'MANAGER') {
            destination = `/${locale}/manager`;
          }

          if (next) {
            try {
              const decoded = decodeURIComponent(next);
              if (decoded.startsWith('/') && !decoded.includes('//') && !decoded.includes('auth/')) {
                destination = decoded;
              }
            } catch {}
          }
          router.replace(destination);
        }
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      const errorKey =
        apiError.code && apiError.code !== 'UNKNOWN' && apiError.code !== 'AUTH_ERROR'
          ? apiError.code
          : apiError.message;
      setError(errorKey);
      toast.error('Sign In Failed', { description: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    setError,
    handlePasswordSignIn,
  };
}
