/**
 * @file auth-errors.ts
 *
 * Client-side map from backend AUTH_ERROR_CODES to next-intl i18n keys.
 *
 * Rules:
 *  - NEVER display raw backend error messages to users.
 *  - Always resolve errorCode → i18n key → translated string.
 *  - If errorCode is unknown, fall back to AUTH_FALLBACK_KEY.
 *
 * The translation keys correspond to entries in:
 *  src/features/auth/messages/en.json → "errors.AUTH_001" etc.
 */

import type { AuthErrorCode } from '../types/auth.types';
import { isAuthErrorCode } from '../types/auth.types';

// ---------------------------------------------------------------------------
// Error code → next-intl message key map
// ---------------------------------------------------------------------------

export const AUTH_ERROR_MESSAGES: Readonly<Record<AuthErrorCode, string>> = {
  AUTH_001: 'errors.AUTH_001',
  AUTH_002: 'errors.AUTH_002',
  AUTH_003: 'errors.AUTH_003',
  AUTH_004: 'errors.AUTH_004',
  AUTH_005: 'errors.AUTH_005',
  AUTH_006: 'errors.AUTH_006',
  AUTH_007: 'errors.AUTH_007',
  AUTH_008: 'errors.AUTH_008',
  AUTH_009: 'errors.AUTH_009',
  AUTH_010: 'errors.AUTH_010',
  AUTH_011: 'errors.AUTH_011',
  AUTH_012: 'errors.AUTH_012',
  AUTH_013: 'errors.AUTH_013',
  AUTH_014: 'errors.AUTH_014',
  AUTH_050: 'errors.AUTH_050',
  AUTH_051: 'errors.AUTH_051',
} as const;

export const AUTH_FALLBACK_KEY = 'errors.unexpected';

// ---------------------------------------------------------------------------
// Resolver utility
// ---------------------------------------------------------------------------

/**
 * Resolve an auth error code to a next-intl message key.
 *
 * Usage with next-intl:
 * ```tsx
 * const t = useTranslations('auth');
 * const key = resolveAuthErrorKey(errorCode);
 * const message = t(key);
 * ```
 *
 * @param errorCode - The `errorCode` field from ApiErrorResponse
 * @returns A next-intl message key within the 'auth' namespace
 */
export function resolveAuthErrorKey(errorCode: string | null | undefined): string {
  if (!errorCode) return AUTH_FALLBACK_KEY;
  if (isAuthErrorCode(errorCode)) {
    return AUTH_ERROR_MESSAGES[errorCode];
  }
  // Not an AUTH_XXX code — could be an HTTP_4XX from the global filter
  return AUTH_FALLBACK_KEY;
}

/**
 * Resolve an error from a network response to a display message.
 * Works without next-intl for cases where the hook is unavailable.
 *
 * @param errorCode - The `errorCode` field from ApiErrorResponse
 * @param fallback - Fallback message if resolution fails
 */
export function resolveAuthErrorMessage(
  errorCode: string | null | undefined,
  fallback: string = 'An error occurred. Please try again.',
): string {
  if (!errorCode) return fallback;
  // The actual translation must be done by the consumer using next-intl.
  // This function is a hint that a typed error occurred.
  return resolveAuthErrorKey(errorCode);
}
