/**
 * @file auth.service.ts
 *
 * Orchestration-only service for the auth domain.
 *
 * Rules:
 *  1. No Prisma calls here — all DB access goes through AuthRepository.
 *  2. No raw Better Auth errors escape this layer — all are caught and
 *     re-thrown as typed AuthException subclasses.
 *  3. Returns typed DTOs only.
 *  4. Business logic lives here, not in the controller or repository.
 */

import { Injectable, Logger } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { UserResponseDto } from './dto/response/user.response.dto';
import { AuthResponseDto } from './dto/response/auth.response.dto';
import { toUserId, toSessionId, isUserRole } from './types/auth.types';
import type { UserId } from './types/auth.types';
import {
  TokenInvalidException,
  DbWriteFailedException,
} from './exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authRepository: AuthRepository) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Session / Profile
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the currently authenticated user's profile.
   * Called by `GET /api/auth/me` after BetterAuthGuard has validated the session.
   */
  async getCurrentUser(userId: UserId): Promise<UserResponseDto> {
    return this.authRepository.findUserById(userId);
  }

  /**
   * Get the full auth context (user + session) for the /me response.
   * Joins user + latest session via the repository.
   */
  async getAuthContext(userId: UserId): Promise<AuthResponseDto> {
    return this.authRepository.getUserWithActiveSession(userId);
  }

  /**
   * Build an AuthResponseDto directly from the BetterAuth guard's session data.
   * Avoids an extra DB round-trip when the guard already fetched the session.
   *
   * Trade-off: Trusts the guard cache rather than DB — acceptable for /me
   * but NOT for sensitive security operations (prefer getAuthContext() there).
   *
   * @param rawSession - The raw session object from BetterAuthGuard (request.session + request.user)
   */
  buildAuthResponseFromRawSession(params: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    role: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    sessionId: string;
    tokenExpiresAt: Date | string;
    twoFactorVerified: boolean;
    createdAt: string;
  }): AuthResponseDto {
    const upperRole = params.role.toUpperCase();
    // isUserRole is a type-guard → narrow explicitly so TS is satisfied
    const resolvedRole = isUserRole(upperRole) ? upperRole : ('CUSTOMER' as const);

    const expiresAt = params.tokenExpiresAt instanceof Date
      ? params.tokenExpiresAt.toISOString()
      : params.tokenExpiresAt;

    return new AuthResponseDto({
      userId: toUserId(params.userId),
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      image: params.image,
      role: resolvedRole,
      emailVerified: params.emailVerified,
      twoFactorEnabled: params.twoFactorEnabled,
      sessionId: toSessionId(params.sessionId),
      tokenExpiresAt: expiresAt,
      twoFactorVerified: params.twoFactorVerified,
      createdAt: params.createdAt,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Session management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Revoke the current session (sign-out).
   * Clears the session from DB — the client must clear its cookies.
   */
  async revokeSession(sessionToken: string): Promise<void> {
    try {
      await this.authRepository.revokeSessionByToken(sessionToken);
    } catch (err) {
      if (err instanceof DbWriteFailedException) throw err;
      this.logger.error({ err }, 'revokeSession failed');
      throw new DbWriteFailedException();
    }
  }

  /**
   * Revoke all sessions except the current one.
   * Called after password change or 2FA toggle.
   */
  async revokeOtherSessions(
    userId: UserId,
    currentToken: string,
  ): Promise<void> {
    try {
      await this.authRepository.revokeOtherSessions(userId, currentToken);
    } catch (err) {
      if (err instanceof DbWriteFailedException) throw err;
      this.logger.error({ err, userId }, 'revokeOtherSessions failed');
      throw new DbWriteFailedException();
    }
  }
}
