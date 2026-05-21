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

import { authClient } from '@/lib/auth-client';
import { clientEnv } from '@/core/env/client';
import {
  AuthApiError,
  ApiSuccessResponse,
  ApiErrorResponse,
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
  register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void>;

  /** Request a magic-link email. */
  requestMagicLink(email: string): Promise<void>;

  /** Request an email OTP code. */
  requestOtp(email: string, type?: 'sign-in' | 'email-verification'): Promise<void>;

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
async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiSuccessResponse<T>> {
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

  // Parse the response body — it always follows our envelope shape
  const body = await response.json() as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok || !body.success) {
    const errorBody = body as ApiErrorResponse;
    throw new AuthApiError({
      message: errorBody.message || 'An error occurred',
      errorCode: errorBody.errorCode || 'UNKNOWN',
      statusCode: response.status,
      requestId: errorBody.requestId || '',
      meta: errorBody.meta,
    });
  }

  return body as ApiSuccessResponse<T>;
}

/**
 * Normalize errors from the Better Auth SDK into AuthApiError.
 * Better Auth SDK returns `{ data, error }` — we extract the error.
 */
function normalizeAuthClientError(error: unknown): never {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const message = typeof e['message'] === 'string' ? e['message'] : 'Authentication error';
    const code = typeof e['code'] === 'string' ? e['code'] : 'UNKNOWN';
    const status = typeof e['status'] === 'number' ? e['status'] : 0;

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

// ---------------------------------------------------------------------------
// Typed auth response mapper
// ---------------------------------------------------------------------------

function mapToUserResponseData(
  rawUser: Record<string, unknown>,
): UserResponseData {
  const role = rawUser['role'];
  const resolvedRole =
    role === 'ADMIN' || role === 'MANAGER' || role === 'CUSTOMER'
      ? role
      : 'CUSTOMER';

  return {
    userId: toUserId(String(rawUser['id'] ?? '')),
    email: String(rawUser['email'] ?? ''),
    displayName: buildDisplayName(rawUser),
    firstName: typeof rawUser['firstName'] === 'string' ? rawUser['firstName'] : null,
    lastName: typeof rawUser['lastName'] === 'string' ? rawUser['lastName'] : null,
    image: typeof rawUser['image'] === 'string' ? rawUser['image'] : null,
    role: resolvedRole,
    emailVerified: Boolean(rawUser['emailVerified']),
    twoFactorEnabled: Boolean(rawUser['twoFactorEnabled']),
    createdAt: String(rawUser['createdAt'] ?? new Date().toISOString()),
    updatedAt: String(rawUser['updatedAt'] ?? new Date().toISOString()),
  };
}

function buildDisplayName(raw: Record<string, unknown>): string {
  const firstName = typeof raw['firstName'] === 'string' ? raw['firstName'] : '';
  const lastName = typeof raw['lastName'] === 'string' ? raw['lastName'] : '';
  const parts = [firstName, lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  const email = String(raw['email'] ?? '');
  return email.split('@')[0] ?? email;
}

// ---------------------------------------------------------------------------
// Exported client object
// ---------------------------------------------------------------------------

export const authApiClient: AuthApiClient = {
  // ─── GET /api/auth/me ────────────────────────────────────────────────────
  async getMe(): Promise<ApiSuccessResponse<AuthResponseData>> {
    return apiFetch<AuthResponseData>('/api/auth/me');
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

    const rawUser = result.data.user as Record<string, unknown>;
    return {
      user: mapToUserResponseData(rawUser),
      requiresTwoFactor: false,
    };
  },

  // ─── Register ────────────────────────────────────────────────────────────
  async register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
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
    type: 'sign-in' | 'email-verification' = 'sign-in',
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
    const result = await (authClient as any).forgetPassword({
      email,
      redirectTo: `${clientEnv.NEXT_PUBLIC_API_URL}/auth/reset-password`,
    });
    if (result.error) {
      normalizeAuthClientError(result.error);
    }
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<void> {
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
      callbackURL: callbackURL ?? `${clientEnv.NEXT_PUBLIC_API_URL}/auth/verify`,
    });
    // Google OAuth redirects — no return value needed
  },
};
