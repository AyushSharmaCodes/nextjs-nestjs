/**
 * @file communication/listeners/auth/two-fa-code.listener.ts
 * Handles AUTH_EVENTS.TWO_FA_CODE_REQUESTED — sends the TOTP code email.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_EVENTS } from '../../../../shared/events/auth/auth-events.constants';
import type { TwoFaCodeRequestedPayload } from '../../../../shared/events/auth/auth-event-payloads.types';
import { EmailService } from '../../services/email.service';
import { TemplateService } from '../../services/template.service';
import { EmailAuditRepository } from '../../repositories/email-audit.repository';
import { COMM_ERROR_CODES } from '../../constants/comm-error-codes.constant';

@Injectable()
export class TwoFaCodeListener {
  private readonly logger = new Logger(TwoFaCodeListener.name);

  constructor(
    private readonly emailService:    EmailService,
    private readonly templateService: TemplateService,
    private readonly auditRepository: EmailAuditRepository,
  ) {}

  @OnEvent(AUTH_EVENTS.TWO_FA_CODE_REQUESTED, { async: true })
  async handle(payload: TwoFaCodeRequestedPayload): Promise<void> {
    const auditId = crypto.randomUUID();

    const alreadyProcessed = await this.auditRepository.existsByEventId(payload.eventId);
    if (alreadyProcessed) {
      this.logger.debug({ commErrorCode: COMM_ERROR_CODES.DUPLICATE_EVENT.code, eventId: payload.eventId }, COMM_ERROR_CODES.DUPLICATE_EVENT.message);
      return;
    }

    const { subject, html, text } = await this.templateService.render(
      '2fa-code',
      payload.locale,
      { totpCode: payload.totpCode, expiresAt: payload.expiresAt, deviceHint: payload.deviceHint },
    );

    await this.auditRepository.create({
      id: auditId, eventId: payload.eventId, eventName: AUTH_EVENTS.TWO_FA_CODE_REQUESTED,
      userId: payload.userId, toEmail: payload.email, status: 'PENDING',
      requestId: payload.requestId, createdAt: new Date().toISOString(),
    });

    try {
      const result = await this.emailService.send({ to: payload.email, subject, html, text, messageId: payload.eventId });
      await this.auditRepository.updateStatus(auditId, { status: 'SENT', providerMessageId: result.providerMessageId, sentAt: result.acceptedAt });
      this.logger.log({ eventId: payload.eventId, requestId: payload.requestId }, 'TwoFaCodeListener: 2FA code email sent');
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : 'Unknown delivery failure';
      await this.auditRepository.updateStatus(auditId, { status: 'FAILED', failReason: reason, failedAt: new Date().toISOString() });
      this.logger.error({
        commErrorCode: COMM_ERROR_CODES.PROVIDER_REJECTED.code,
        eventId: payload.eventId, requestId: payload.requestId, userId: payload.userId, auditId, reason,
      }, `TwoFaCodeListener: FAILED — ${reason}`);
    }
  }
}
