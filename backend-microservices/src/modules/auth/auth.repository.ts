/**
 * @file auth.repository.ts
 *
 * THE ONLY place Prisma is called within the auth domain.
 *
 * Rules:
 *  1. Every method returns a typed DTO (never a raw Prisma entity).
 *  2. Prisma errors are caught and re-thrown as AuthException subclasses.
 *  3. No business logic here — queries + mapping only.
 *  4. Never expose password, accessToken, backupCodes in return values.
 *
 * The repository injects PrismaService (the singleton NestJS wrapper).
 */

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { AuthMapper } from './mappers/auth.mapper';
import { UserResponseDto } from './dto/response/user.response.dto';
import { AuthResponseDto } from './dto/response/auth.response.dto';
import type { UserId } from './types/auth.types';
import {
  EmailAlreadyExistsException,
  DbWriteFailedException,
  TokenInvalidException,
} from './exceptions/auth.exceptions';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // User queries
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Find a user by their primary key.
   * Throws TokenInvalidException if the user does not exist
   * (not NotFoundException — callers in the auth flow use this after
   * validating a session, so a missing user means an invalid token).
   */
  async findUserById(id: UserId): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        // Only select fields needed for UserResponseDto — never fetch password
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          emailVerified: true,
          role: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new TokenInvalidException({ userId: id });
      }

      // Build a full PrismaUser-shaped object for the mapper
      return AuthMapper.toUserResponseDto({
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as Parameters<typeof AuthMapper.toUserResponseDto>[0]);
    } catch (err) {
      if (err instanceof TokenInvalidException) throw err;
      this.logger.error({ err, userId: id }, 'findUserById failed');
      throw new DbWriteFailedException();
    }
  }

  /**
   * Find a user by email — returns null if not found (not an error).
   * Used for existence checks before auth operations.
   */
  async findUserByEmail(email: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          emailVerified: true,
          role: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) return null;

      return AuthMapper.toUserResponseDto({
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as Parameters<typeof AuthMapper.toUserResponseDto>[0]);
    } catch (err) {
      this.logger.error({ err, email }, 'findUserByEmail failed');
      throw new DbWriteFailedException();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auth context queries (user + session together)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch a user plus their most recently active session.
   * Used by GET /api/auth/me to return the full AuthResponseDto.
   *
   * If userId is valid but no active session exists, throws TokenInvalidException.
   */
  async getUserWithActiveSession(userId: UserId): Promise<AuthResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          emailVerified: true,
          role: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              token: true,
              expiresAt: true,
              createdAt: true,
              updatedAt: true,
              ipAddress: true,
              userAgent: true,
              userId: true,
              twoFactorVerified: true,
            },
          },
        },
      });

      if (!user) {
        throw new TokenInvalidException({ userId });
      }

      const session = user.sessions[0];
      if (!session) {
        throw new TokenInvalidException({ userId, reason: 'no-active-session' });
      }

      // Map raw prisma shapes to full objects for mapper
      const prismaUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as Parameters<typeof AuthMapper.toAuthResponseDto>[0];

      const prismaSession = {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        userId: session.userId,
        twoFactorVerified: session.twoFactorVerified ?? null,
      } as Parameters<typeof AuthMapper.toAuthResponseDto>[1];

      return AuthMapper.toAuthResponseDto(prismaUser, prismaSession);
    } catch (err) {
      if (err instanceof TokenInvalidException) throw err;
      this.logger.error({ err, userId }, 'getUserWithActiveSession failed');
      throw new DbWriteFailedException();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Session operations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Revoke a specific session by its token.
   * Used by the logout / session-management endpoint.
   */
  async revokeSessionByToken(token: string): Promise<void> {
    try {
      await this.prisma.session.deleteMany({ where: { token } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        // Session not found — already deleted, not an error
        return;
      }
      this.logger.error({ err, token }, 'revokeSessionByToken failed');
      throw new DbWriteFailedException();
    }
  }

  /**
   * Revoke all sessions for a user EXCEPT the currently active one.
   * Used after password change / 2FA enable (security session rotation).
   */
  async revokeOtherSessions(userId: UserId, currentToken: string): Promise<void> {
    try {
      await this.prisma.session.deleteMany({
        where: {
          userId,
          token: { not: currentToken },
        },
      });
    } catch (err) {
      this.logger.error({ err, userId }, 'revokeOtherSessions failed');
      throw new DbWriteFailedException();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Write operations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Update a user's role — admin-only operation.
   * Returns the updated UserResponseDto.
   */
  async updateUserRole(
    userId: UserId,
    role: string,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          emailVerified: true,
          role: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return AuthMapper.toUserResponseDto({
        ...user,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        image: user.image ?? null,
      } as Parameters<typeof AuthMapper.toUserResponseDto>[0]);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') throw new EmailAlreadyExistsException();
        if (err.code === 'P2025') throw new TokenInvalidException({ userId });
      }
      this.logger.error({ err, userId }, 'updateUserRole failed');
      throw new DbWriteFailedException();
    }
  }
}
