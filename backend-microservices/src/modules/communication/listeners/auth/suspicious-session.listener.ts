/**
 * @file communication/listeners/auth/suspicious-session.listener.ts
 *
 * Handles AUTH_EVENTS.SESSION_SUSPICIOUS — sends security alert email.
 *
 * Template branching:
 *   HIGH_RISK  → 'suspicious-login-high-risk' (session auto-revoked banner)
 *   SUSPICIOUS → 'suspicious-login'           (confirm/revoke CTAs)
 *
 * This listener follows the standard PENDING → SENT/FAILED audit lifecycle
 * pattern used by all 11 auth email listeners.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import type { SuspiciousSessionPayload } from '../../../../shared/events/auth/auth-event-payloads.types';
import { AUTH_EVENTS } from '../../../../shared/events/auth/auth-events.constants';
import { COMM_ERROR_CODES } from '../../constants/comm-error-codes.constant';
import { EmailAuditRepository } from '../../repositories/email-audit.repository';
import { EmailService } from '../../services/email.service';
import { TemplateService } from '../../services/template.service';
import type { EmailTemplateName, TemplateContext } from '../../types/email.types';

// Human-readable reason descriptions for email body
const REASON_LABELS: Record<string, string> = {
  NEW_IP: 'Sign-in from a new IP address',
  NEW_DEVICE_FINGERPRINT: 'Sign-in from an unrecognised device',
  IMPOSSIBLE_TRAVEL: 'Sign-in location is physically impossible given your last location',
  NEW_COUNTRY: 'Sign-in from a country not seen on your account before',
  CONCURRENT_FOREIGN: 'Simultaneous active session detected from a different country',
};

@Injectable()
export class SuspiciousSessionListener {
  private readonly logger = new Logger(SuspiciousSessionListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    private readonly auditRepository: EmailAuditRepository,
    private readonly config: ConfigService,
  ) {}

  @OnEvent(AUTH_EVENTS.SESSION_SUSPICIOUS, { async: true })
  async handle(payload: SuspiciousSessionPayload): Promise<void> {
    const auditId = crypto.randomUUID();

    // ── Idempotency guard ────────────────────────────────────────────────────
    try {
      const alreadyProcessed = await this.auditRepository.existsByEventId(payload.eventId);
      if (alreadyProcessed) {
        this.logger.debug(
          { commErrorCode: COMM_ERROR_CODES.DUPLICATE_EVENT.code, eventId: payload.eventId },
          COMM_ERROR_CODES.DUPLICATE_EVENT.message,
        );
        return;
      }
    } catch {
      // If the idempotency check fails, proceed (safe: worst case is one duplicate email)
    }

    // ── Select template based on risk level ──────────────────────────────────
    const templateName: EmailTemplateName =
      payload.riskLevel === 'HIGH_RISK' ? 'suspicious-login-high-risk' : 'suspicious-login';

    // ── Build template context ───────────────────────────────────────────────
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://merigaumata.com');
    const locale = this.normalizeLocale(payload.locale);

    const context: TemplateContext = {
      displayName: payload.email.split('@')[0],
      ipAddress: payload.ipAddress as string,
      signedInAt: payload.signedInAt,
      // Location
      city: payload.city,
      region: payload.region,
      country: payload.country as string,
      // Device
      os: payload.os,
      osVersion: payload.osVersion,
      browser: payload.browser,
      browserVersion: payload.browserVersion,
      deviceType: payload.deviceType,
      // Risk
      riskLevel: payload.riskLevel,
      suspicionReasons: payload.suspicionReasons.map(r => REASON_LABELS[r] ?? r),
      // CTAs (only relevant for SUSPICIOUS — high-risk template uses single secureUrl)
      confirmUrl: `${frontendUrl}/${locale}/auth/session/confirm/${payload.sessionId}`,
      revokeUrl: `${frontendUrl}/${locale}/auth/session/revoke/${payload.sessionId}`,
      secureUrl: `${frontendUrl}/${locale}/auth/security`,
    };

    // ── Render template ──────────────────────────────────────────────────────
    let subject: string;
    let html: string;
    let text: string;

    try {
      const rendered = await this.templateService.render(templateName, payload.locale, context);
      subject = rendered.subject;
      html = rendered.html;
      text = rendered.text;
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { commErrorCode: COMM_ERROR_CODES.TEMPLATE_RENDER_FAILED.code, eventId: payload.eventId, reason },
        `SuspiciousSessionListener: template render failed — ${reason}`,
      );
      return; // Cannot send without a rendered template
    }

    // ── Write PENDING audit record ───────────────────────────────────────────
    await this.auditRepository.create({
      id: auditId,
      eventId: payload.eventId,
      eventName: AUTH_EVENTS.SESSION_SUSPICIOUS,
      userId: payload.userId,
      toEmail: payload.email,
      status: 'PENDING',
      requestId: payload.requestId,
      createdAt: new Date().toISOString(),
    });

    // ── Send + update audit ──────────────────────────────────────────────────
    try {
      const result = await this.emailService.send({
        to: payload.email,
        subject,
        html,
        text,
        messageId: payload.eventId,
      });

      await this.auditRepository.updateStatus(auditId, {
        status: 'SENT',
        providerMessageId: result.providerMessageId,
        sentAt: result.acceptedAt,
      });

      this.logger.log(
        {
          eventId: payload.eventId,
          requestId: payload.requestId,
          sessionId: payload.sessionId,
          riskLevel: payload.riskLevel,
          template: templateName,
        },
        `SuspiciousSessionListener: alert email sent (${payload.riskLevel})`,
      );
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : 'Unknown delivery failure';
      await this.auditRepository.updateStatus(auditId, {
        status: 'FAILED',
        failReason: reason,
        failedAt: new Date().toISOString(),
      });
      this.logger.error(
        {
          commErrorCode: COMM_ERROR_CODES.PROVIDER_REJECTED.code,
          eventId: payload.eventId,
          requestId: payload.requestId,
          userId: payload.userId,
          auditId,
          reason,
        },
        `SuspiciousSessionListener: FAILED — ${reason}`,
      );
    }
  }

  private normalizeLocale(locale: string | undefined): string {
    const normalized = (locale ?? 'en').toLowerCase();
    if (normalized === 'en' || normalized === 'hi' || normalized === 'ta' || normalized === 'te') {
      return normalized;
    }
    return 'en';
  }
}
