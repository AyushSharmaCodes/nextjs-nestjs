import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { magicLinkSchema } from '../schemas/auth.schema';
import { normalizeError } from '@/shared/lib/errors/api-error';

export function useMagicLink(
  locale: string, 
  acceptedTerms: boolean,
  externalEmail?: string,
  externalSetEmail?: (val: string) => void
) {
  const [localEmail, setLocalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const email = externalEmail !== undefined ? externalEmail : localEmail;
  const setEmail = externalSetEmail !== undefined ? externalSetEmail : setLocalEmail;

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('termsRequired');
      return;
    }
    const validation = magicLinkSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.signIn.magicLink({
        email,
        callbackURL: `${window.location.origin}/${locale}/auth/verify`,
      });
      if (res.error) {
        throw res.error;
      } else {
        toast.success('Magic link sent!', { description: `Check your inbox at ${email}` });
        setMagicLinkSent(true);
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      setError(apiError.message);
      toast.error('Failed to send magic link', { description: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    setError,
    magicLinkSent,
    setMagicLinkSent,
    handleMagicLinkSubmit,
  };
}
