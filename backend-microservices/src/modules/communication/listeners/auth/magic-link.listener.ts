/**
 * @file communication/listeners/auth/magic-link.listener.ts
 * Handles AUTH_EVENTS.MAGIC_LINK_REQUESTED — sends the magic sign-in link email.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { MagicLinkRequestedPayload } from '../../../../shared/events/auth/auth-event-payloads.types';
import { AUTH_EVENTS } from '../../../../shared/events/auth/auth-events.constants';
import { COMM_ERROR_CODES } from '../../constants/comm-error-codes.constant';
import { EmailAuditRepository } from '../../repositories/email-audit.repository';
import { EmailService } from '../../services/email.service';
import { TemplateService } from '../../services/template.service';

@Injectable()
export class MagicLinkListener {
  private readonly logger = new Logger(MagicLinkListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    private readonly auditRepository: EmailAuditRepository,
  ) {}

  @OnEvent(AUTH_EVENTS.MAGIC_LINK_REQUESTED, { async: true })
  async handle(payload: MagicLinkRequestedPayload): Promise<void> {
    const auditId = crypto.randomUUID();

    const alreadyProcessed = await this.auditRepository.existsByEventId(payload.eventId);
    if (alreadyProcessed) {
      this.logger.debug(
        { commErrorCode: COMM_ERROR_CODES.DUPLICATE_EVENT.code, eventId: payload.eventId },
        COMM_ERROR_CODES.DUPLICATE_EVENT.message,
      );
      return;
    }

    const { subject, html, text } = await this.templateService.render('magic-link', payload.locale, {
      magicLinkUrl: payload.magicLinkUrl,
      expiresAt: payload.expiresAt,
    });

    await this.auditRepository.create({
      id: auditId,
      eventId: payload.eventId,
      eventName: AUTH_EVENTS.MAGIC_LINK_REQUESTED,
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
        'MagicLinkListener: magic link email sent',
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
        `MagicLinkListener: FAILED — ${reason}`,
      );
    }
  }
}
