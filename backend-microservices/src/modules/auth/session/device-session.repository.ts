/**
 * @file auth/session/device-session.repository.ts
 *
 * All Prisma calls for DeviceSession persistence.
 *
 * DeviceSession is a write-once security audit table.
 * Session liveness is NOT tracked here — that is owned by Better Auth.
 *
 * Methods:
 *   create()              — write the audit record at sign-in
 *   findRecentByUserId()  — fetch history for risk assessment
 *   findById()            — for ownership validation in trust/revoke endpoints
 *   findBySessionId()     — for trust/revoke actions from email link
 *   findAllByUserId()     — for GET /auth/sessions (joined with BA by controller)
 *   markTrusted()         — trust this device (isTrusted=true)
 *
 * Intentionally absent (owned by Better Auth):
 *   revokeSession()       — call BA's session.delete/update instead
 *   revokeAllForUser()    — call BA's session.deleteMany instead
 *   updateLastSeen()      — no liveness tracking in this table
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { DeviceSessionMapper } from './device-session.mapper';
import { SESSION_RISK_RULES } from './constants/session-risk-rules.constant';
import type {
  DeviceSessionEntity,
  CreateDeviceSessionDto,
  FindRecentOptions,
} from '../../../shared/types/device.types';
import type { UserId, SessionId } from '../../../shared/types/index';

@Injectable()
export class DeviceSessionRepository {
  private readonly logger = new Logger(DeviceSessionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Write the audit record at sign-in time. Called exactly once per sign-in. */
  async create(dto: CreateDeviceSessionDto): Promise<DeviceSessionEntity> {
    try {
      const raw = await this.prisma.deviceSession.create({
        data: {
          userId:              dto.userId,
          betterAuthSessionId: dto.betterAuthSessionId,
          sessionId:           dto.sessionId,
          ipAddress:           dto.ipAddress,
          city:                dto.geoLocation.city ?? undefined,
          region:              dto.geoLocation.region ?? undefined,
          country:             dto.geoLocation.country,
          latitude:            dto.geoLocation.latitude ?? undefined,
          longitude:           dto.geoLocation.longitude ?? undefined,
          isp:                 dto.geoLocation.isp ?? undefined,
          deviceType:          dto.device.deviceType,
          os:                  dto.device.os,
          osVersion:           dto.device.osVersion,
          browser:             dto.device.browser,
          browserVersion:      dto.device.browserVersion,
          fingerprint:         dto.device.fingerprint,
          riskLevel:           dto.riskLevel,
          suspicionReasons:    [...dto.suspicionReasons],
        },
      });
      return DeviceSessionMapper.toDomain(raw);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error({ userId: dto.userId, reason }, `DeviceSessionRepository.create failed`);
      throw new Error(`DeviceSession.create failed: ${reason}`);
    }
  }

  /**
   * Fetch user's recent sign-in history for risk assessment.
   * Ordered by createdAt DESC — most recent first.
   *
   * This is the primary read path — called at every sign-in.
   * Result is passed to RiskAssessmentService.assess() as the history parameter.
   */
  async findRecentByUserId(
    userId:  UserId,
    options: FindRecentOptions,
  ): Promise<ReadonlyArray<DeviceSessionEntity>> {
    try {
      const raws = await this.prisma.deviceSession.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        take:    Math.min(options.limit, SESSION_RISK_RULES.MAX_HISTORY_FETCH),
      });
      return DeviceSessionMapper.toDomainArray(raws);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error({ userId, reason }, `DeviceSessionRepository.findRecentByUserId failed`);
      throw new Error(`DeviceSession.findRecentByUserId failed: ${reason}`);
    }
  }

  /**
   * Find all DeviceSession records for a user ordered by createdAt DESC.
   * Used by GET /auth/sessions — the controller enriches with BA session liveness.
   */
  async findAllByUserId(userId: UserId): Promise<ReadonlyArray<DeviceSessionEntity>> {
    try {
      const raws = await this.prisma.deviceSession.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
      });
      return DeviceSessionMapper.toDomainArray(raws);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error({ userId, reason }, `DeviceSessionRepository.findAllByUserId failed`);
      throw new Error(`DeviceSession.findAllByUserId failed: ${reason}`);
    }
  }

  /** Find by sessionId (= BA session.token = JWT claim). Used for trust/revoke by email link. */
  async findBySessionId(sessionId: SessionId): Promise<DeviceSessionEntity | null> {
    try {
      const raw = await this.prisma.deviceSession.findUnique({ where: { sessionId } });
      return raw ? DeviceSessionMapper.toDomain(raw) : null;
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error({ sessionId, reason }, `DeviceSessionRepository.findBySessionId failed`);
      throw new Error(`DeviceSession.findBySessionId failed: ${reason}`);
    }
  }

  /** Find by internal DB id. Used for ownership validation in trust/revoke endpoints. */
  async findById(id: string): Promise<DeviceSessionEntity | null> {
    try {
      const raw = await this.prisma.deviceSession.findUnique({ where: { id } });
      return raw ? DeviceSessionMapper.toDomain(raw) : null;
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error({ id, reason }, `DeviceSessionRepository.findById failed`);
      throw new Error(`DeviceSession.findById failed: ${reason}`);
    }
  }

  /**
   * Mark a device as trusted — "This was me" action from the suspicious login email.
   * This only sets isTrusted on the DeviceSession record.
   * Revoking the BA session is done separately via PrismaService.session.
   */
  async markTrusted(id: string): Promise<DeviceSessionEntity> {
    try {
      const raw = await this.prisma.deviceSession.update({
        where: { id },
        data:  { isTrusted: true, trustGrantedAt: new Date() },
      });
      return DeviceSessionMapper.toDomain(raw);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error({ id, reason }, `DeviceSessionRepository.markTrusted failed`);
      throw new Error(`DeviceSession.markTrusted failed: ${reason}`);
    }
  }
}
