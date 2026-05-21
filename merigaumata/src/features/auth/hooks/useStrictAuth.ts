/**
 * @file useStrictAuth.ts
 *
 * Strictly typed hook adapting the Better Auth session into a cohesive
 * UI domain state with ZERO `any` or `unknown` casts.
 *
 * Usage:
 *  const auth = useStrictAuth();
 *  if (auth.status === 'authenticated') {
 *    console.log(auth.user.email); // fully typed
 *  }
 */

import { authClient } from '../../../lib/auth-client';
import { isRole } from '../types/auth.types';
import type { Role } from '../types/auth.types';

// ---------------------------------------------------------------------------
// Strict types
// ---------------------------------------------------------------------------

export interface StrictUser {
  id: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  requiresPasswordChange: boolean;
}

export interface StrictSession {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  twoFactorVerified: boolean;
}

export type AuthState =
  | { status: 'loading'; user: null; session: null; error: null; refetch: () => void }
  | { status: 'error'; user: null; session: null; error: Error; refetch: () => void }
  | { status: 'unauthenticated'; user: null; session: null; error: null; refetch: () => void }
  | { status: 'authenticated'; user: StrictUser; session: StrictSession; error: null; refetch: () => void };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns a discriminated union AuthState — narrow on `status` before
 * accessing `user` or `session`.
 */
export function useStrictAuth(): AuthState {
  const { data, isPending, error, refetch } = authClient.useSession();

  const refetchSession = (): void => {
    refetch();
  };

  if (isPending) {
    return { status: 'loading', user: null, session: null, error: null, refetch: refetchSession };
  }

  if (error) {
    return {
      status: 'error',
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error(String(error)),
      refetch: refetchSession,
    };
  }

  if (!data?.user || !data?.session) {
    return { status: 'unauthenticated', user: null, session: null, error: null, refetch: refetchSession };
  }

  // ─── Type-safe user extraction ─────────────────────────────────────────
  // Better Auth returns `data.user` as a partial type — we narrow each field.
  const rawUser = data.user as Record<string, unknown>;

  // Narrow role: default to CUSTOMER for unrecognized values
  const rawRole = rawUser['role'];
  const normalizedRole = typeof rawRole === 'string' ? rawRole.toUpperCase() : '';
  const resolvedRole: Role = isRole(normalizedRole) ? normalizedRole : 'CUSTOMER';

  // Narrow name fields — Better Auth maps `name` to `firstName` via user.fields config
  const firstName =
    typeof rawUser['firstName'] === 'string'
      ? rawUser['firstName']
      : typeof data.user.name === 'string'
        ? data.user.name
        : null;

  const lastName =
    typeof rawUser['lastName'] === 'string'
      ? rawUser['lastName']
      : null;

  const twoFactorEnabled =
    typeof rawUser['twoFactorEnabled'] === 'boolean'
      ? rawUser['twoFactorEnabled']
      : false;

  const mappedUser: StrictUser = {
    id: data.user.id,
    email: data.user.email,
    firstName,
    lastName,
    role: resolvedRole,
    requiresPasswordChange: false,
    image: data.user.image ?? null,
    emailVerified: data.user.emailVerified,
    twoFactorEnabled,
  };

  // ─── Type-safe session extraction ─────────────────────────────────────
  const rawSession = data.session as Record<string, unknown>;

  const twoFactorVerified =
    typeof rawSession['twoFactorVerified'] === 'boolean'
      ? rawSession['twoFactorVerified']
      : false;

  const mappedSession: StrictSession = {
    id: data.session.id,
    expiresAt: new Date(data.session.expiresAt),
    token: data.session.token,
    createdAt: new Date(data.session.createdAt),
    updatedAt: new Date(data.session.updatedAt),
    ipAddress: typeof data.session.ipAddress === 'string' ? data.session.ipAddress : null,
    userAgent: typeof data.session.userAgent === 'string' ? data.session.userAgent : null,
    userId: data.session.userId,
    twoFactorVerified,
  };

  return {
    status: 'authenticated',
    user: mappedUser,
    session: mappedSession,
    error: null,
    refetch: refetchSession,
  };
}
