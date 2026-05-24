import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { forgotPasswordSchema } from '../schemas/auth.schema';
import { toast } from '@/shared/lib/toast';
import { normalizeError } from '@/shared/lib/errors/api-error';

export function useForgotPassword(
  locale: string,
  acceptedTerms: boolean,
  externalEmail?: string,
  externalSetEmail?: (val: string) => void,
) {
  const [localEmail, setLocalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const email = externalEmail !== undefined ? externalEmail : localEmail;
  const setEmail = externalSetEmail !== undefined ? externalSetEmail : setLocalEmail;

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('termsRequired');
      return;
    }
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.$fetch<{ status: boolean; message: string }>('/request-password-reset', {
        method: 'POST',
        body: {
          email,
          redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
        },
      });
      if (res.error) {
        throw res.error;
      } else {
        toast.success('Reset link sent!', { description: `Check ${email} for instructions.` });
        setForgotPasswordSent(true);
      }
    } catch (err: unknown) {
      const apiError = normalizeError(err);
      const errorKey =
        apiError.code && apiError.code !== 'UNKNOWN' && apiError.code !== 'AUTH_ERROR'
          ? apiError.code
          : apiError.message;
      setError(errorKey);
      toast.error('Failed to send reset link', { description: apiError.message });
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
    forgotPasswordSent,
    setForgotPasswordSent,
    handleForgotPasswordSubmit,
  };
}
