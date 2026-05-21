/**
 * @file jwt-payload.interface.ts
 *
 * Shape of the JWT payload used by Better Auth's session cache cookie
 * (`better-auth.session_data`). This is NOT a custom-issued JWT — it is
 * the one Better Auth signs internally when `session.cookieCache.strategy`
 * is set to `'jwt'`.
 *
 * We define this interface so:
 *  1. The middleware can type-safely decode the JWT cache.
 *  2. The BetterAuthGuard can narrow session fields without casting to `any`.
 *
 * Trade-off: Because we don't control Better Auth's signing, we cannot
 * guarantee every field is present. All optional fields are marked `?`
 * and callers must narrow before use.
 */

import type { UserId, SessionId, UserRole } from '../types/auth.types';

/**
 * Decoded payload of the `better-auth.session_data` JWT cache cookie.
 * This corresponds to the nested structure Better Auth emits.
 */
export interface JwtPayload {
  /** The JWT standard subject — maps to the DB session.token value. */
  readonly sub?: string;

  /** Issued-at Unix timestamp (seconds). */
  readonly iat?: number;

  /** Expiry Unix timestamp (seconds). */
  readonly exp?: number;

  /** Nested user snapshot embedded by Better Auth. */
  readonly user?: JwtUserSnapshot;

  /** Nested session snapshot embedded by Better Auth. */
  readonly session?: JwtSessionSnapshot;
}

/**
 * User fields embedded within the JWT payload.
 * Better Auth embeds a subset of user fields for edge validation.
 */
export interface JwtUserSnapshot {
  readonly id: UserId;
  readonly email: string;
  readonly role?: UserRole;
  readonly emailVerified?: boolean;
  readonly twoFactorEnabled?: boolean;
}

/**
 * Session fields embedded within the JWT payload.
 */
export interface JwtSessionSnapshot {
  readonly id: SessionId;
  readonly token: string;
  readonly expiresAt?: string;      // ISO 8601
  readonly twoFactorVerified?: boolean;
}

/**
 * Internal payload shape used by our auth service / repository layer
 * (not the raw JWT cookie payload). This represents a fully validated
 * and type-safe session context after BetterAuthGuard has run.
 */
export interface ValidatedSession {
  readonly userId: UserId;
  readonly sessionId: SessionId;
  readonly email: string;
  readonly role: UserRole;
  readonly twoFactorVerified: boolean;
  readonly expiresAt: string; // ISO 8601
}
