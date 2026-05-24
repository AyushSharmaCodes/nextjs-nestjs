/**
 * @file communication/listeners/auth/two-fa-enabled.listener.ts
 * Handles AUTH_EVENTS.TWO_FA_ENABLED — confirmation email when 2FA is turned on.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { TwoFaEnabledPayload } from '../../../../shared/events/auth/auth-event-payloads.types';
import { AUTH_EVENTS } from '../../../../shared/events/auth/auth-events.constants';
import { COMM_ERROR_CODES } from '../../constants/comm-error-codes.constant';
import { EmailAuditRepository } from '../../repositories/email-audit.repository';
import { EmailService } from '../../services/email.service';
import { TemplateService } from '../../services/template.service';

@Injectable()
export class TwoFaEnabledListener {
  private readonly logger = new Logger(TwoFaEnabledListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    private readonly auditRepository: EmailAuditRepository,
  ) {}

  @OnEvent(AUTH_EVENTS.TWO_FA_ENABLED, { async: true })
  async handle(payload: TwoFaEnabledPayload): Promise<void> {
    const auditId = crypto.randomUUID();

    const alreadyProcessed = await this.auditRepository.existsByEventId(payload.eventId);
    if (alreadyProcessed) {
      this.logger.debug(
        { commErrorCode: COMM_ERROR_CODES.DUPLICATE_EVENT.code, eventId: payload.eventId },
        COMM_ERROR_CODES.DUPLICATE_EVENT.message,
      );
      return;
    }

    const { subject, html, text } = await this.templateService.render('2fa-enabled', payload.locale, {
      enabledAt: payload.enabledAt,
    });

    await this.auditRepository.create({
      id: auditId,
      eventId: payload.eventId,
      eventName: AUTH_EVENTS.TWO_FA_ENABLED,
      userId: payload.userId,
      toEmail: payload.email,
      status: 'PENDING',
      requestId: payload.requestId,
      createdAt: new Date().toISOString(),
    });

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
        { eventId: payload.eventId, requestId: payload.requestId },
        'TwoFaEnabledListener: confirmation email sent',
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
        `TwoFaEnabledListener: FAILED — ${reason}`,
      );
    }
  }
}
