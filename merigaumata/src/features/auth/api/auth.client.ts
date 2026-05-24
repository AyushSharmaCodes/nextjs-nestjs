/**
 * @file auth.client.ts
 *
 * Typed API client for the auth feature.
 *
 * This wraps the Better Auth client (`authClient` from lib/auth-client.ts)
 * and our custom backend endpoints (e.g. /api/auth/me) into one cohesive,
 * fully typed interface.
 *
 * Rules:
 *  1. NEVER return raw network error strings to consumers.
 *  2. All errors are caught and re-thrown as AuthApiError (typed).
 *  3. All return types are explicit — ZERO `any` / `unknown` without narrowing.
 *  4. Cookies are never touched in JS — the browser / Better Auth manages them.
 *
 * Architecture note:
 *  The Better Auth SDK methods (signIn.email, emailOtp, etc.) are re-exported
 *  through this client so consumers have a single import point.
 */

import { clientEnv } from '@/core/env/client';
import { routing } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';
import { extractAuthResponseData } from '../lib/auth-response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthApiError,
  AuthResponseData,
  UserResponseData,
  isAuthErrorCode,
  toUserId,
} from '../types/auth.types';

// ---------------------------------------------------------------------------
// Interface definition
// ---------------------------------------------------------------------------

export interface AuthApiClient {
  /** Get the current user's profile (calls GET /api/auth/me). */
  getMe(): Promise<ApiSuccessResponse<AuthResponseData>>;

  /** Sign in with email and password. */
  signInWithPassword(payload: {
    email: string;
    password: string;
  }): Promise<{ user: UserResponseData | null; requiresTwoFactor: boolean }>;

  /** Register a new account with email and password. */
  register(payload: { email: string; password: string; firstName: string; lastName: string }): Promise<void>;

  /** Request a magic-link email. */
  requestMagicLink(email: string): Promise<void>;

  /** Request an email OTP code. */
  requestOtp(
    email: string,
    type?: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email',
  ): Promise<void>;

  /** Verify an email OTP code and complete sign-in. */
  verifyOtp(payload: { email: string; otp: string }): Promise<void>;

  /** Request a password reset email. */
  requestPasswordReset(email: string): Promise<void>;

  /** Complete password reset with a new password. */
  resetPassword(payload: { token: string; newPassword: string }): Promise<void>;

  /** Sign out — clears session cookie via Better Auth. */
  signOut(): Promise<void>;

  /** Sign in with Google OAuth (redirects). */
  signInWithGoogle(callbackURL?: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Fetch wrapper that:
 *  1. Calls the backend endpoint with credentials
 *  2. Parses the ApiSuccessResponse or ApiErrorResponse
 *  3. Throws AuthApiError on failures
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<ApiSuccessResponse<T>> {
  const baseUrl = clientEnv.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse;
    throw new AuthApiError({
      message: errorBody.message || 'An error occurred',
      errorCode: errorBody.errorCode || 'UNKNOWN',
      statusCode: response.status,
      requestId: errorBody.requestId || '',
      meta: errorBody.meta,
    });
  }

  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    (body as { success?: unknown }).success === true &&
    'data' in body
  ) {
    return body as ApiSuccessResponse<T>;
  }

  return {
    success: true,
    data: body as T,
    message: 'OK',
    statusCode: response.status,
    timestamp: new Date().toISOString(),
    requestId: response.headers.get('x-trace-id') ?? '',
  };
}

function normalizeAuthClientError(error: { message?: string; code?: string; status?: number } | null): never {
  if (error && typeof error === 'object') {
    const message = error.message || 'Authentication error';
    const code = error.code || 'UNKNOWN';
    const status = error.status || 0;

    throw new AuthApiError({
      message,
      errorCode: isAuthErrorCode(code) ? code : 'UNKNOWN',
      statusCode: status,
      requestId: '',
    });
  }
  throw new AuthApiError({
    message: 'An unexpected authentication error occurred',
    errorCode: 'UNKNOWN',
    statusCode: 0,
    requestId: '',
  });
}

function resolveAuthRedirectUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (typeof window !== 'undefined') {
    const [, maybeLocale] = window.location.pathname.split('/');
    const locale = (routing.locales as readonly string[]).includes(maybeLocale) ? maybeLocale : null;

    return `${window.location.origin}${locale ? `/${locale}` : ''}${normalizedPath}`;
  }

  return `${clientEnv.NEXT_PUBLIC_APP_URL}${normalizedPath}`;
}

interface RawUserFields {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  updatedAt?: string;
  role?: string;
}

function mapToUserResponseData(rawUser: RawUserFields): UserResponseData {
  const role = rawUser.role;
  const resolvedRole = role === 'ADMIN' || role === 'MANAGER' || role === 'CUSTOMER' ? role : 'CUSTOMER';

  return {
    userId: toUserId(String(rawUser.id ?? '')),
    email: String(rawUser.email ?? ''),
    displayName: buildDisplayName(rawUser),
    firstName: rawUser.firstName ?? null,
    lastName: rawUser.lastName ?? null,
    image: rawUser.image ?? null,
    role: resolvedRole,
    emailVerified: Boolean(rawUser.emailVerified),
    twoFactorEnabled: Boolean(rawUser.twoFactorEnabled),
    createdAt: rawUser.createdAt ?? new Date().toISOString(),
    lastLoginAt: rawUser.lastLoginAt ?? null,
    updatedAt: rawUser.updatedAt ?? new Date().toISOString(),
  };
}

function buildDisplayName(raw: RawUserFields): string {
  const firstName = raw.firstName || '';
  const lastName = raw.lastName || '';
  const parts = [firstName, lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  const email = raw.email || '';
  return email.split('@')[0] ?? email;
}

// ---------------------------------------------------------------------------
// Exported client object
// ---------------------------------------------------------------------------

export const authApiClient: AuthApiClient = {
  // ─── GET /api/auth/me ────────────────────────────────────────────────────
  async getMe(): Promise<ApiSuccessResponse<AuthResponseData>> {
    const response = await apiFetch<AuthResponseData>('/api/auth/me');
    const normalized = extractAuthResponseData(response.data);

    if (!normalized) {
      throw new AuthApiError({
        message: 'Invalid auth session response',
        errorCode: 'UNKNOWN',
        statusCode: response.statusCode,
        requestId: response.requestId,
      });
    }

    return {
      ...response,
      data: normalized,
    };
  },

  // ─── Sign in with email/password ─────────────────────────────────────────
  async signInWithPassword(payload: {
    email: string;
    password: string;
  }): Promise<{ user: UserResponseData | null; requiresTwoFactor: boolean }> {
    const result = await authClient.signIn.email({
      email: payload.email,
      password: payload.password,
    });

    if (result.error) {
      normalizeAuthClientError(result.error);
    }

    // If 2FA is pending, the SDK returns twoFactorRedirect
    if (!result.data) {
      return { user: null, requiresTwoFactor: true };
    }

    // We double cast through unknown because Better Auth returns a partial raw user object whose keys are checked at runtime.
    const rawUser = result.data.user as unknown as RawUserFields;
    return {
      user: mapToUserResponseData(rawUser),
      requiresTwoFactor: false,
    };
  },

  // ─── Register ────────────────────────────────────────────────────────────
  async register(payload: { email: string; password: string; firstName: string; lastName: string }): Promise<void> {
    const result = await authClient.signUp.email({
      email: payload.email,
      password: payload.password,
      name: payload.firstName,
      lastName: payload.lastName,
    });

    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  // ─── Magic link ──────────────────────────────────────────────────────────
  async requestMagicLink(email: string): Promise<void> {
    const result = await authClient.signIn.magicLink({ email });
    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  // ─── OTP ─────────────────────────────────────────────────────────────────
  async requestOtp(
    email: string,
    type: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email' = 'sign-in',
  ): Promise<void> {
    const result = await authClient.emailOtp.sendVerificationOtp({
      email,
      type,
    });
    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  async verifyOtp(payload: { email: string; otp: string }): Promise<void> {
    const result = await authClient.signIn.emailOtp({
      email: payload.email,
      otp: payload.otp,
    });
    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  // ─── Password reset ───────────────────────────────────────────────────────
  async requestPasswordReset(email: string): Promise<void> {
    // We double cast through unknown to access dynamic methods on Better Auth client namespace that are not exposed in standard types.
    const client = authClient as unknown as {
      forgetPassword: (options: { email: string; redirectTo: string }) => Promise<{
        data: null;
        error: { message?: string; code?: string; status?: number } | null;
      }>;
    };
    const result = await client.forgetPassword({
      email,
      redirectTo: resolveAuthRedirectUrl('/auth/reset-password'),
    });
    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  async resetPassword(payload: { token: string; newPassword: string }): Promise<void> {
    const result = await authClient.resetPassword({
      newPassword: payload.newPassword,
      token: payload.token,
    });
    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  // ─── Sign out ─────────────────────────────────────────────────────────────
  async signOut(): Promise<void> {
    const result = await authClient.signOut();
    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  async signInWithGoogle(callbackURL?: string): Promise<void> {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: callbackURL ?? resolveAuthRedirectUrl('/auth/verify'),
    });
    // Google OAuth redirects — no return value needed
  },
};
