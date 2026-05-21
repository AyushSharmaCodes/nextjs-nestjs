import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function useGoogleSignIn(locale: string, acceptedTerms: boolean) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!acceptedTerms) {
      setError('termsRequired');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/${locale}/auth/verify`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, loading, error, setError };
}
