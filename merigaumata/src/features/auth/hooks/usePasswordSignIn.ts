import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { loginSchema } from '../schemas/auth.schema';
import { normalizeError } from '@/shared/lib/errors/api-error';

export function usePasswordSignIn(
  locale: string, 
  acceptedTerms: boolean,
  externalEmail?: string,
  externalSetEmail?: (val: string) => void
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
        toast.success('Successfully signed in!', { description: 'Welcome back!' });
        // Carry the ?next= param forward so VerifyForm redirects to the
        // originally requested page after session is confirmed.
        const next = searchParams.get('next');
        const verifyPath = `/${locale}/auth/verify${next ? `?next=${encodeURIComponent(next)}` : ''}`;
        router.replace(verifyPath);
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      const errorKey = apiError.code && apiError.code !== 'UNKNOWN' && apiError.code !== 'AUTH_ERROR' ? apiError.code : apiError.message;
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
