import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { signupSchema } from '../schemas/auth.schema';
import { normalizeError } from '@/shared/lib/errors/api-error';

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const checkPasswordStrength = (password: string) => {
  return PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;
};

export function usePasswordSignUp(
  locale: string, 
  acceptedTerms: boolean,
  externalEmail?: string,
  externalSetEmail?: (val: string) => void
) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = externalEmail !== undefined ? externalEmail : localEmail;
  const setEmail = externalSetEmail !== undefined ? externalSetEmail : setLocalEmail;

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('termsRequired');
      return;
    }
    const validation = signupSchema.safeParse({ firstName, lastName, email, password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    const strength = checkPasswordStrength(password);
    if (strength < PASSWORD_REQUIREMENTS.length) {
      setError('passwordComplexity');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name: firstName,
        lastName,
        callbackURL: `${window.location.origin}/${locale}/auth/verify`,
      });
      if (res.error) {
        throw res.error;
      } else {
        toast.success('Account created successfully!', { description: 'Logging you in...' });
        router.replace(`/${locale}/auth/verify`);
      }
    } catch (err) {
      const apiError = normalizeError(err);
      setError(apiError.message);
      toast.error('Registration Failed', { description: apiError.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    setError,
    handlePasswordSignUp,
    passwordRequirements: PASSWORD_REQUIREMENTS,
    checkPasswordStrength,
  };
}
