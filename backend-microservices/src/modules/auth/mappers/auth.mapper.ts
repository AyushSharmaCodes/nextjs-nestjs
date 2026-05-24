/**
 * @file auth.mapper.ts
 *
 * The ONLY place where raw Prisma entities are converted into typed DTOs.
 *
 * Rules enforced here:
 *  1. Raw Prisma types NEVER exit this file.
 *  2. password, accessToken, refreshToken, backupCodes are NEVER included.
 *  3. All Date objects → ISO 8601 strings.
 *  4. IDs are wrapped with branded type constructors.
 *  5. role is narrowed to the UserRole union — defaults to 'CUSTOMER'.
 *
 * Trade-off: Using a static class (rather than an injectable service) because
 * the mapper has no dependencies and should be pure / testable in isolation.
 */

import { Logger } from '@nestjs/common';
import type { User as PrismaUser, Session as PrismaSession } from '@prisma/client';
import { toUserId, toSessionId, isUserRole } from '../types/auth.types';
import type { UserRole } from '../types/auth.types';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { AuthResponseDto } from '../dto/response/auth.response.dto';
import { TokenResponseDto } from '../dto/response/token.response.dto';

export class AuthMapper {
  private static readonly logger = new Logger(AuthMapper.name);

  /**
   * Map a raw Prisma User into a UserResponseDto.
   * NEVER includes password, accountId, or any provider-level fields.
   */
  static toUserResponseDto(entity: PrismaUser): UserResponseDto {
    return new UserResponseDto({
      userId: toUserId(entity.id),
      email: entity.email,
      firstName: entity.firstName ?? null,
      lastName: entity.lastName ?? null,
      image: entity.image ?? null,
      emailVerified: entity.emailVerified,
      role: AuthMapper.resolveRole(entity.role),
      twoFactorEnabled: entity.twoFactorEnabled ?? false,
      createdAt: entity.createdAt.toISOString(),
      lastLoginAt: entity.lastLoginAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt.toISOString(),
    });
  }

  /**
   * Map a Prisma User + Session pair into an AuthResponseDto.
   * Used for the `GET /api/auth/me` endpoint response.
   */
  static toAuthResponseDto(
    user: PrismaUser,
    session: PrismaSession,
  ): AuthResponseDto {
    return new AuthResponseDto({
      userId: toUserId(user.id),
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      image: user.image ?? null,
      role: AuthMapper.resolveRole(user.role),
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      sessionId: toSessionId(session.id),
      tokenExpiresAt: session.expiresAt.toISOString(),
      twoFactorVerified: session.twoFactorVerified ?? false,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    });
  }

  /**
   * Map a Prisma Session into a TokenResponseDto.
   */
  static toTokenResponseDto(session: PrismaSession): TokenResponseDto {
    return new TokenResponseDto({
      sessionId: toSessionId(session.id),
      expiresAt: session.expiresAt.toISOString(),
      twoFactorVerified: session.twoFactorVerified ?? false,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Narrow raw DB role string to the UserRole union.
   * Defaults to 'CUSTOMER' for unrecognized values — never throws.
   */
  private static resolveRole(raw: string | null | undefined): UserRole {
    const normalized = (raw ?? '').toUpperCase();
    if (isUserRole(normalized)) {
      return normalized;
    }
    // Log unexpected role in development — silent default in production
    if (process.env.NODE_ENV !== 'production' && raw) { // ts-audit-ignore
      AuthMapper.logger.warn(`Unrecognized role "${raw}", defaulting to CUSTOMER`);
    }
    return 'CUSTOMER';
  }
}
