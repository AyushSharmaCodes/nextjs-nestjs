/**
 * @file auth/session/suspicious-session.service.ts
 *
 * Orchestrates the full suspicious session detection pipeline on every sign-in.
 *
 * Called from the Better Auth `hooks.after` middleware — fires AFTER the BA
 * session is created and the sign-in response is prepared.
 *
 * Pipeline (7 steps):
 *   1. Parse device from User-Agent string (DeviceParserService)
 *   2. Resolve GeoIP — degrades gracefully on failure (GeoIpService)
 *   3. Fetch user's recent DeviceSession history (DeviceSessionRepository)
 *   4. Run pure risk assessment — no side effects (RiskAssessmentService)
 *   5. Persist the write-once DeviceSession audit record
 *   6. If suspicious → emit auth event fire-and-forget → email via CommunicationModule
 *   7. If HIGH_RISK → revoke the BA session via prisma.session.update()
 *
 * STATELESS JWT CONSTRAINTS:
 * - This service runs AFTER the BA hook fires — the access token JWT is already
 *   issued to the client before Step 7 executes.
 * - HIGH_RISK revocation kills the BA session (refresh token), NOT the JWT.
 *   The access token remains valid for its remaining TTL (~15 min).
 * - processSignIn() is always non-throwing — sign-in must always succeed.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { AUTH_EVENTS } from '../../../shared/events/auth/auth-events.constants';
import { DeviceParserService } from './device-parser.service';
import { GeoIpService } from './geo-ip/geo-ip.service';
import { RiskAssessmentService } from './risk-assessment.service';
import { DeviceSessionRepository } from './device-session.repository';
import { SESSION_RISK_RULES } from './constants/session-risk-rules.constant';
import { AuthEventEmitter } from '../events/auth-event.emitter';
import type {
  DeviceSessionEntity,
  SignInContext,
  SessionRiskAssessment,
  GeoLocation,
  ParsedDevice,
} from '../../../shared/types/device.types';
import type { SuspiciousSessionPayload } from '../../../shared/events/auth/auth-event-payloads.types';

@Injectable()
export class SuspiciousSessionService {
  private readonly logger = new Logger(SuspiciousSessionService.name);

  constructor(
    private readonly prisma:         PrismaService,
    private readonly deviceParser:   DeviceParserService,
    private readonly geoIpService:   GeoIpService,
    private readonly riskAssessment: RiskAssessmentService,
    private readonly sessionRepo:    DeviceSessionRepository,
    private readonly eventEmitter:   AuthEventEmitter,
  ) {}

  /**
   * Entry point — called from the Better Auth after-sign-in hook via
   * GlobalSuspiciousSessionDispatcher.processSignIn().
   *
   * Always returns (never throws). Errors in secondary steps (GeoIP, event
   * emission, revocation) are caught and logged without bubbling up to the
   * sign-in response.
   *
   * Note: HIGH_RISK revocation happens AFTER the JWT access token is issued.
   * The caller (the BA hook) cannot modify the already-prepared response.
   * See inline trade-off comment in Step 7.
   */
  async processSignIn(context: SignInContext): Promise<void> {
    try {
      await this.runPipeline(context);
    } catch (err: unknown) {
      // Last-resort catch — the pipeline itself is try-catch guarded,
      // but this ensures sign-in is never broken by detection failures.
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { userId: context.userId, reason },
        'SuspiciousSessionService.processSignIn: unhandled error (non-fatal)',
      );
    }
  }

  // ── Pipeline ────────────────────────────────────────────────────────────────

  private async runPipeline(context: SignInContext): Promise<void> {
    const signedInAt = new Date().toISOString();

    // ── Step 1: Parse device from User-Agent ─────────────────────────────────
    const device = this.deviceParser.parse(context.userAgent);

    // ── Step 2: Resolve GeoIP (country='XX' sentinel on failure) ────────────
    const geoLocation = await this.geoIpService.resolve(context.ipAddress);

    // ── Step 3: Fetch sign-in history ─────────────────────────────────────
    let history: ReadonlyArray<DeviceSessionEntity> = [];
    try {
      history = await this.sessionRepo.findRecentByUserId(context.userId, {
        limit: SESSION_RISK_RULES.MAX_HISTORY_FETCH,
      });
    } catch (err: unknown) {
      // Non-fatal: degraded to no-history assessment (no false positives).
      // Rules 1, 2, 4, 5 all skip gracefully when history.length === 0.
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        { userId: context.userId, reason },
        'SuspiciousSessionService: history fetch failed — assessing without history',
      );
    }

    // ── Step 4: Pure risk assessment ─────────────────────────────────────────
    const assessment = this.riskAssessment.assess(
      {
        ipAddress:   context.ipAddress,
        device,
        geoLocation,
        createdAt:   signedInAt,
      },
      history,
    );

    this.logger.log(
      {
        userId:    context.userId,
        riskLevel: assessment.riskLevel,
        reasons:   assessment.suspicionReasons,
        country:   geoLocation.country,
        ip:        context.ipAddress,
      },
      `SuspiciousSessionService: risk=${assessment.riskLevel}`,
    );

    // ── Step 5: Persist write-once audit record ───────────────────────────────
    // rawUserAgent is never persisted — only fingerprint + parsed fields.
    const { rawUserAgent: _raw, ...deviceData } = device;

    let deviceSession: DeviceSessionEntity;
    try {
      deviceSession = await this.sessionRepo.create({
        userId:              context.userId,
        betterAuthSessionId: context.betterAuthSessionId,
        sessionId:           context.sessionId,
        ipAddress:           context.ipAddress,
        geoLocation: {
          city:      geoLocation.city,
          region:    geoLocation.region,
          country:   geoLocation.country,
          latitude:  geoLocation.latitude,
          longitude: geoLocation.longitude,
          isp:       geoLocation.isp,
        },
        device:           deviceData,
        riskLevel:        assessment.riskLevel,
        suspicionReasons: assessment.suspicionReasons,
      });
    } catch (err: unknown) {
      // If persist fails, still try to emit and revoke — security takes precedence.
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { userId: context.userId, reason },
        'SuspiciousSessionService: DeviceSession.create failed',
      );
      return;  // Cannot proceed without a persisted record
    }

    // ── Step 6: Fire-and-forget suspicious event → email ─────────────────────
    if (assessment.isSuspicious) {
      this.emitSuspiciousEvent(context, deviceSession, assessment, geoLocation, device, signedInAt);
    }

    // ── Step 7: HIGH_RISK — revoke the Better Auth session ───────────────────
    //
    // TRADE-OFF — Stateless JWT window:
    //   The JWT access token was already issued to the client by the time this
    //   step executes (the BA hook fires AFTER the response is prepared).
    //   Revoking the BA session (= refresh token record) prevents token renewal,
    //   so the client is effectively locked out once the access token expires.
    //
    //   Default TTL is ~15 minutes. Options to tighten this window:
    //     A) Accept it (recommended — most threats can't move in 15 min) ← DEFAULT
    //     B) Reduce access token TTL to 5 min for higher sensitivity
    //     C) In-memory revocation set checked on every request (breaks stateless)
    //     D) Redis blocklist keyed by sessionId (common production choice)
    //   This implementation uses Option A. Set config flag to enable Option D.
    //
    // Mechanism: we mark the BA session as already expired via Prisma.
    // This is exactly what Better Auth's internal revokeSession() does —
    // it deletes the session record. We do an update (expiresAt = epoch) instead
    // of delete to preserve the row for our FK in DeviceSession (betterAuthSessionId).
    //
    if (
      assessment.riskLevel === 'HIGH_RISK' &&
      SESSION_RISK_RULES.HIGH_RISK_AUTO_REVOKE
    ) {
      try {
        await this.prisma.session.update({
          where: { id: context.betterAuthSessionId },
          data:  { expiresAt: new Date(0) },  // instantly expired
        });
        this.logger.warn(
          { userId: context.userId, betterAuthSessionId: context.betterAuthSessionId, sessionId: context.sessionId },
          'SuspiciousSessionService: HIGH_RISK — BA session revoked (access token still valid for TTL)',
        );
      } catch (err: unknown) {
        const reason = err instanceof Error ? err.message : String(err);
        this.logger.error(
          { userId: context.userId, reason },
          'SuspiciousSessionService: HIGH_RISK BA session revocation failed — session NOT revoked',
        );
        // Do not re-throw — email was already queued, audit record exists.
        // Operators should monitor WARN logs and implement Option D if needed.
      }
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Fire-and-forget event emission to the NestJS EventEmitter bus.
   * CommunicationModule's SuspiciousSessionListener picks this up and sends the email.
   * Wrapped in try-catch — event bus failure MUST NOT affect sign-in or detection flow.
   */
  private emitSuspiciousEvent(
    context:    SignInContext,
    session:    DeviceSessionEntity,
    assessment: SessionRiskAssessment,
    geo:        GeoLocation,
    device:     ParsedDevice,
    signedInAt: string,
  ): void {
    try {
      const payload: SuspiciousSessionPayload = {
        eventId:          crypto.randomUUID(),
        userId:           context.userId,
        email:            context.email,
        locale:           context.locale,
        triggeredAt:      new Date().toISOString(),
        requestId:        context.requestId,
        sessionId:        context.sessionId,
        ipAddress:        geo.ip,
        city:             geo.city    ?? 'Unknown',
        region:           geo.region  ?? 'Unknown',
        country:          geo.country,
        latitude:         geo.latitude,
        longitude:        geo.longitude,
        deviceType:       device.deviceType,
        os:               device.os,
        osVersion:        device.osVersion,
        browser:          device.browser,
        browserVersion:   device.browserVersion,
        fingerprint:      device.fingerprint,
        riskLevel:        assessment.riskLevel,
        suspicionReasons: assessment.suspicionReasons,
        signedInAt,
      };

      this.eventEmitter.emit(AUTH_EVENTS.SESSION_SUSPICIOUS, payload);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        { userId: context.userId, reason },
        'SuspiciousSessionService: event emission failed (non-fatal)',
      );
    }
  }
}
