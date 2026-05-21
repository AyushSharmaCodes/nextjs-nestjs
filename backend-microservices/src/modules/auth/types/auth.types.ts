/**
 * @file auth.types.ts
 * Branded primitive types and utility types for the auth module.
 *
 * ZERO `any` / `unknown` without narrowing — enforced by strict TypeScript.
 *
 * Trade-off: branded types add a tiny casting cost at creation sites
 * (`userId as UserId`) but give compile-time proof that IDs are never
 * accidentally swapped. Worth it for a security-critical module.
 */

// ---------------------------------------------------------------------------
// Branded ID types
// ---------------------------------------------------------------------------

/**
 * A string that has been validated as a real user primary key.
 * Use `toUserId(raw)` helper to create, never plain `string as UserId`.
 */
export type UserId = string & { readonly _brand: 'UserId' };

/**
 * A string that has been validated as a real session primary key.
 */
export type SessionId = string & { readonly _brand: 'SessionId' };

// ---------------------------------------------------------------------------
// Safe constructors — only call these after the value comes from DB / auth
// ---------------------------------------------------------------------------

/** Wrap a raw DB user ID into a branded UserId. */
export function toUserId(raw: string): UserId {
  if (!raw || typeof raw !== 'string') {
    throw new TypeError(`toUserId: expected non-empty string, got ${JSON.stringify(raw)}`);
  }
  return raw as UserId;
}

/** Wrap a raw DB session ID into a branded SessionId. */
export function toSessionId(raw: string): SessionId {
  if (!raw || typeof raw !== 'string') {
    throw new TypeError(`toSessionId: expected non-empty string, got ${JSON.stringify(raw)}`);
  }
  return raw as SessionId;
}

// ---------------------------------------------------------------------------
// Domain role enum
// ---------------------------------------------------------------------------

/** All valid roles in the application — must stay in sync with Prisma schema. */
export type UserRole = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

export const USER_ROLES: Readonly<Record<UserRole, UserRole>> = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CUSTOMER: 'CUSTOMER',
} as const;

/** Type-guard: checks whether an arbitrary string is a valid UserRole. */
export function isUserRole(value: string): value is UserRole {
  return value === 'ADMIN' || value === 'MANAGER' || value === 'CUSTOMER';
}

// ---------------------------------------------------------------------------
// Auth provider type
// ---------------------------------------------------------------------------

export type AuthProvider = 'credential' | 'google' | 'magic-link' | 'email-otp';

// ---------------------------------------------------------------------------
// Token metadata (used in mapper)
// ---------------------------------------------------------------------------

/**
 * Minimal token metadata the mapper needs to build AuthResponseDto.
 * We never expose raw access/refresh tokens in the response — cookies only.
 */
export interface TokenMeta {
  readonly sessionId: SessionId;
  readonly expiresAt: string; // ISO 8601
}
