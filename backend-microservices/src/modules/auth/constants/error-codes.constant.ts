/**
 * @file error-codes.constant.ts
 * Central error-code registry for the auth module.
 *
 * RULES:
 *  1. Every exception thrown in this module MUST reference a code from this object.
 *  2. Never throw raw string messages — always use a code.
 *  3. The i18nKey mirrors the nestjs-i18n translation path: `auth.errors.<key>`.
 */

export const AUTH_ERROR_CODES = {
  // ─── 400-range client errors ───────────────────────────────────────────

  /** Wrong email or password supplied. */
  INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    httpStatus: 401,
    i18nKey: 'auth.errors.INVALID_CREDENTIALS',
  },

  /** Attempt to register with an email already in the users table. */
  EMAIL_ALREADY_EXISTS: {
    code: 'AUTH_002',
    httpStatus: 409,
    i18nKey: 'auth.errors.EMAIL_ALREADY_EXISTS',
  },

  /** User account exists but the email has not been verified yet. */
  EMAIL_NOT_VERIFIED: {
    code: 'AUTH_003',
    httpStatus: 403,
    i18nKey: 'auth.errors.EMAIL_NOT_VERIFIED',
  },

  /** The OTP code has passed its expiry window (10 minutes). */
  OTP_EXPIRED: {
    code: 'AUTH_004',
    httpStatus: 410,
    i18nKey: 'auth.errors.OTP_EXPIRED',
  },

  /** The OTP code submitted does not match the stored value. */
  OTP_INVALID: {
    code: 'AUTH_005',
    httpStatus: 400,
    i18nKey: 'auth.errors.OTP_INVALID',
  },

  /** The magic-link token has passed its expiry window. */
  MAGIC_LINK_EXPIRED: {
    code: 'AUTH_006',
    httpStatus: 410,
    i18nKey: 'auth.errors.MAGIC_LINK_EXPIRED',
  },

  /** The magic-link token is malformed or not found in the DB. */
  MAGIC_LINK_INVALID: {
    code: 'AUTH_007',
    httpStatus: 400,
    i18nKey: 'auth.errors.MAGIC_LINK_INVALID',
  },

  /** The magic-link token has already been consumed. */
  MAGIC_LINK_ALREADY_USED: {
    code: 'AUTH_008',
    httpStatus: 409,
    i18nKey: 'auth.errors.MAGIC_LINK_ALREADY_USED',
  },

  /** Access token or session has expired. */
  TOKEN_EXPIRED: {
    code: 'AUTH_009',
    httpStatus: 401,
    i18nKey: 'auth.errors.TOKEN_EXPIRED',
  },

  /** Access token is malformed or signature verification failed. */
  TOKEN_INVALID: {
    code: 'AUTH_010',
    httpStatus: 401,
    i18nKey: 'auth.errors.TOKEN_INVALID',
  },

  /** Refresh token reuse detected → entire session is revoked. */
  REFRESH_TOKEN_REUSE: {
    code: 'AUTH_011',
    httpStatus: 401,
    i18nKey: 'auth.errors.REFRESH_TOKEN_REUSE',
  },

  /** Google OAuth returned an error or profile normalization failed. */
  GOOGLE_AUTH_FAILED: {
    code: 'AUTH_012',
    httpStatus: 502,
    i18nKey: 'auth.errors.GOOGLE_AUTH_FAILED',
  },

  /** The account has been temporarily locked (too many failed attempts). */
  ACCOUNT_LOCKED: {
    code: 'AUTH_013',
    httpStatus: 423,
    i18nKey: 'auth.errors.ACCOUNT_LOCKED',
  },

  /** The account has been administratively disabled. */
  ACCOUNT_DISABLED: {
    code: 'AUTH_014',
    httpStatus: 403,
    i18nKey: 'auth.errors.ACCOUNT_DISABLED',
  },

  // ─── 500-range server errors ────────────────────────────────────────────

  /** JWT signing or session token generation failed at the infrastructure level. */
  TOKEN_GENERATION_FAILED: {
    code: 'AUTH_050',
    httpStatus: 500,
    i18nKey: 'auth.errors.TOKEN_GENERATION_FAILED',
  },

  /** A required database write operation failed. */
  DB_WRITE_FAILED: {
    code: 'AUTH_051',
    httpStatus: 500,
    i18nKey: 'auth.errors.DB_WRITE_FAILED',
  },
} as const;

/**
 * Union of all valid error code keys.
 * Use this as parameter/return types to enforce registry membership.
 *
 * @example
 * function throwAuth(code: AuthErrorCode) { ... }
 */
export type AuthErrorCode = keyof typeof AUTH_ERROR_CODES;

/**
 * Retrieve the full error descriptor for a code key.
 * Narrows the return type to the specific entry.
 */
export function getAuthErrorDescriptor<K extends AuthErrorCode>(
  key: K,
): (typeof AUTH_ERROR_CODES)[K] {
  return AUTH_ERROR_CODES[key];
}

/**
 * Lookup a code string (e.g. "AUTH_001") and return the matching key.
 * Returns `null` if not found — callers must narrow before using.
 *
 * Trade-off: linear scan is fine since the registry is tiny and this is
 * called only in the exception filter, not on the hot path.
 */
export function findAuthErrorKeyByCode(
  code: string,
): AuthErrorCode | null {
  for (const key of Object.keys(AUTH_ERROR_CODES) as AuthErrorCode[]) {
    if (AUTH_ERROR_CODES[key].code === code) {
      return key;
    }
  }
  return null;
}
