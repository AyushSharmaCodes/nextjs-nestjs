/**
 * @file auth.response.dto.ts
 *
 * Composite auth response that is returned on successful sign-in, sign-up,
 * OTP verification, magic-link verification, and Google OAuth completion.
 *
 * Combines UserResponseDto + TokenResponseDto into one envelope.
 *
 * This is what `GET /api/auth/me` returns, and what the frontend stores
 * in its session context.
 */

import type { UserId, UserRole } from '../../types/auth.types';
import type { SessionId } from '../../types/auth.types';

export class AuthResponseDto {
  /** Branded user ID. */
  readonly userId: UserId;

  readonly email: string;

  readonly displayName: string;

  readonly firstName: string | null;

  readonly lastName: string | null;

  readonly image: string | null;

  readonly role: UserRole;

  readonly emailVerified: boolean;

  readonly twoFactorEnabled: boolean;

  // ── Session / Token metadata (no raw tokens) ──────────────────────────

  readonly sessionId: SessionId;

  /** ISO 8601 — when this session expires. */
  readonly tokenExpiresAt: string;

  readonly twoFactorVerified: boolean;

  // ── Audit ─────────────────────────────────────────────────────────────

  /** ISO 8601 — account created date. */
  readonly createdAt: string;

  /** ISO 8601 — null until the first completed sign-in. */
  readonly lastLoginAt: string | null;

  constructor(params: {
    userId: UserId;
    email: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    role: UserRole;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    sessionId: SessionId;
    tokenExpiresAt: string;
    twoFactorVerified: boolean;
    createdAt: string;
    lastLoginAt: string | null;
  }) {
    this.userId = params.userId;
    this.email = params.email;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.image = params.image;
    this.role = params.role;
    this.emailVerified = params.emailVerified;
    this.twoFactorEnabled = params.twoFactorEnabled;
    this.sessionId = params.sessionId;
    this.tokenExpiresAt = params.tokenExpiresAt;
    this.twoFactorVerified = params.twoFactorVerified;
    this.createdAt = params.createdAt;
    this.lastLoginAt = params.lastLoginAt;

    // Build display name
    const parts = [params.firstName, params.lastName].filter(Boolean);
    this.displayName =
      parts.length > 0
        ? parts.join(' ')
        : params.email.split('@')[0] ?? params.email;
  }
}
