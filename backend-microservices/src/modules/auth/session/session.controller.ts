/**
 * @file auth/session/session.controller.ts
 *
 * REST endpoints for device session management.
 *
 * Routes (all require valid JWT via middleware/guard, though BA injects user into req):
 *   GET  /auth/sessions                         → list active sessions
 *   POST /auth/session/confirm/:sessionId       → trust this device
 *   POST /auth/session/revoke/:sessionId        → revoke a session
 *   DELETE /auth/sessions                       → revoke ALL sessions (except current)
 *
 * SECURITY:
 *   - sessionId ownership is validated before any mutation.
 *   - DeviceSession is our audit log. Liveness is owned by Better Auth.
 *   - To check if a session is active, we join with BA's session table.
 *   - To revoke a session, we delete it from BA's session table (or update expiresAt).
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { DeviceSessionRepository } from './device-session.repository';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import type {
  DeviceSessionResponseDto,
  SessionActionResponseDto,
} from './dto/session-response.dto';
import type { DeviceSessionWithActivity } from '../../../shared/types/device.types';
import { toUserId, toSessionId } from '../../../shared/types/index';

/** Extend Fastify Request with the Better Auth user/session object if middleware sets it. */
interface AuthenticatedRequest extends FastifyRequest {
  user?: { id: string; email: string };
  session?: { token: string }; // The current JWT session token
}

@Controller('auth')
export class SessionController {
  private readonly logger = new Logger(SessionController.name);

  constructor(
    private readonly sessionRepo: DeviceSessionRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /auth/sessions
   * Returns the authenticated user's device sessions enriched with liveness.
   * Fingerprint is NEVER returned — it could aid session spoofing.
   */
  @Get('sessions')
  async listSessions(
    @Req() req: AuthenticatedRequest,
  ): Promise<DeviceSessionResponseDto[]> {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    // 1. Fetch all audit records for this user
    const auditSessions = await this.sessionRepo.findAllByUserId(toUserId(userId));

    // 2. Fetch active sessions from Better Auth
    const activeBaSessions = await this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: { token: true },
    });
    const activeTokens = new Set(activeBaSessions.map(s => s.token));

    // 3. Map and enrich
    const enrichedSessions: DeviceSessionWithActivity[] = auditSessions.map(session => ({
      ...session,
      isCurrentlyActive: activeTokens.has(session.sessionId),
    }));

    return enrichedSessions.map(this.toResponseDto);
  }

  /**
   * POST /auth/session/confirm/:sessionId
   * Mark a session as trusted — "This was me" CTA in the suspicious login email.
   * Validates that the session belongs to the authenticated user.
   */
  @Post('session/confirm/:sessionId')
  async confirmSession(
    @Param('sessionId') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<SessionActionResponseDto> {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    // sessionId here is the BA session token (= JWT claim)
    const session = await this.sessionRepo.findBySessionId(toSessionId(sessionId));
    if (!session) throw new NotFoundException('Session not found');
    
    if (session.userId !== toUserId(userId)) {
      this.logger.warn({ userId, sessionId }, 'Ownership violation on confirm');
      throw new ForbiddenException('You do not own this session');
    }

    await this.sessionRepo.markTrusted(session.id);

    return {
      success:   true,
      sessionId,
      message:   'Session trusted. This device will not be flagged again.',
    };
  }

  /**
   * POST /auth/session/revoke/:sessionId
   * Revoke a specific session — "This wasn't me" CTA or manual revoke.
   * Validates ownership before revoking.
   */
  @Post('session/revoke/:sessionId')
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<SessionActionResponseDto> {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const session = await this.sessionRepo.findBySessionId(toSessionId(sessionId));
    if (!session) throw new NotFoundException('Session not found');
    
    if (session.userId !== toUserId(userId)) {
      this.logger.warn({ userId, sessionId }, 'Ownership violation on revoke');
      throw new ForbiddenException('You do not own this session');
    }

    // Revoke the session in Better Auth (by deleting it or expiring it)
    // We update expiresAt to epoch to match SuspiciousSessionService HIGH_RISK logic
    try {
      await this.prisma.session.update({
        where: { id: session.betterAuthSessionId },
        data:  { expiresAt: new Date(0) },
      });
    } catch (err) {
      // If it's already deleted/expired, that's fine
      this.logger.warn({ sessionId }, 'Failed to update BA session for revocation (maybe already deleted)');
    }

    return {
      success:   true,
      sessionId,
      message:   'Session revoked. If this was suspicious, please change your password.',
    };
  }

  /**
   * DELETE /auth/sessions
   * Revoke ALL active sessions for the authenticated user, optionally except the current one.
   * Typically called after password change or detected account compromise.
   */
  @Delete('sessions')
  async revokeAllSessions(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const currentToken = req.session?.token;

    if (currentToken) {
      // Revoke all EXCEPT current
      await this.prisma.session.deleteMany({
        where: {
          userId,
          token: { not: currentToken },
        },
      });
    } else {
      // Revoke ALL
      await this.prisma.session.deleteMany({
        where: { userId },
      });
    }

    return {
      success: true,
      message: 'Other sessions revoked.',
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Map DeviceSessionWithActivity → DTO (fingerprint excluded). */
  private toResponseDto(session: DeviceSessionWithActivity): DeviceSessionResponseDto {
    return {
      id:                 session.id,
      sessionId:          session.sessionId as string,
      ipAddress:          session.ipAddress as string,
      city:               session.geoLocation.city,
      region:             session.geoLocation.region,
      country:            session.geoLocation.country as string,
      deviceType:         session.device.deviceType,
      os:                 session.device.os,
      osVersion:          session.device.osVersion,
      browser:            session.device.browser,
      browserVersion:     session.device.browserVersion,
      isTrusted:          session.isTrusted,
      riskLevel:          session.riskLevel,
      suspicionReasons:   [...session.suspicionReasons],
      isCurrentlyActive:  session.isCurrentlyActive,
      createdAt:          session.createdAt,
    };
  }
}
