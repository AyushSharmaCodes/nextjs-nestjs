/**
 * @file better-auth-config.interface.ts
 *
 * Typed documentation interface for the Better Auth configuration.
 * This does NOT replace the `betterAuth({...})` call — it exists so
 * engineers can understand what fields are expected and typed, without
 * reaching into undocumented Better Auth internals.
 *
 * Note: Better Auth does not export a clean config type, so we model
 * what we actually use and add JSDoc for the rest.
 */

import type { UserRole } from '../types/auth.types';

/**
 * Additional session fields we configure via `session.additionalFields`.
 */
export interface BetterAuthSessionAdditionalFields {
  /** Set to true once the user has passed 2FA verification in this session. */
  readonly twoFactorVerified: boolean;
}

/**
 * Additional user fields we configure via `user.additionalFields`.
 */
export interface BetterAuthUserAdditionalFields {
  readonly lastName: string | null;
  readonly role: UserRole;
  readonly lastLoginAt: Date | null;
}

/**
 * Rate-limit rule shape used in `rateLimit.customRules`.
 */
export interface BetterAuthRateLimitRule {
  readonly window: number;  // seconds
  readonly max: number;     // max requests per window
}

/**
 * Documented shape of the `auth.api.getSession()` return value.
 * Better Auth's actual return type is not exported, so we mirror it here.
 */
export interface BetterAuthSession {
  readonly user: BetterAuthSessionUser;
  readonly session: BetterAuthSessionRecord;
}

export interface BetterAuthSessionUser {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly image: string | null;
  readonly emailVerified: boolean;
  /** Additional fields from user.additionalFields config */
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly role?: UserRole;
  readonly twoFactorEnabled?: boolean;
  readonly lastLoginAt?: Date | string | null;
}

export interface BetterAuthSessionRecord {
  readonly id: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly userId: string;
  /** Additional session fields from session.additionalFields config */
  readonly twoFactorVerified?: boolean | null;
}
