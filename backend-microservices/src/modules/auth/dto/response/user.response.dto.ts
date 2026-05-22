/**
 * @file user.response.dto.ts
 *
 * Typed response DTO for a user record.
 *
 * RULES:
 *  - NEVER include: password, hashedOtp, accessToken, refreshToken, or any
 *    account/TwoFactor internal fields.
 *  - All dates are ISO 8601 strings (never Date objects).
 *  - `id` is branded as UserId.
 *  - This class is the ONLY user shape that exits the repository layer.
 */

import type { UserId, UserRole } from '../../types/auth.types';

export class UserResponseDto {
  /** Branded user ID — never a plain string. */
  readonly userId: UserId;

  readonly email: string;

  readonly firstName: string | null;

  readonly lastName: string | null;

  /**
   * Computed display name: "FirstName LastName" if available,
   * otherwise the email local-part.
   */
  readonly displayName: string;

  readonly image: string | null;

  readonly emailVerified: boolean;

  readonly role: UserRole;

  readonly twoFactorEnabled: boolean;

  /** ISO 8601 string — NEVER a Date object. */
  readonly createdAt: string;

  /** ISO 8601 string — null until the first completed sign-in. */
  readonly lastLoginAt: string | null;

  /** ISO 8601 string — NEVER a Date object. */
  readonly updatedAt: string;

  constructor(params: {
    userId: UserId;
    email: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    emailVerified: boolean;
    role: UserRole;
    twoFactorEnabled: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    updatedAt: string;
  }) {
    this.userId = params.userId;
    this.email = params.email;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.image = params.image;
    this.emailVerified = params.emailVerified;
    this.role = params.role;
    this.twoFactorEnabled = params.twoFactorEnabled;
    this.createdAt = params.createdAt;
    this.lastLoginAt = params.lastLoginAt;
    this.updatedAt = params.updatedAt;

    // Build display name
    const parts = [params.firstName, params.lastName].filter(Boolean);
    this.displayName =
      parts.length > 0
        ? parts.join(' ')
        : params.email.split('@')[0] ?? params.email;
  }
}
