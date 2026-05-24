/**
 * @file communication/listeners/auth/email-change.listener.ts
 * Handles AUTH_EVENTS.EMAIL_CHANGE_REQUESTED — sends email change verification link.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { EmailChangeRequestedPayload } from '../../../../shared/events/auth/auth-event-payloads.types';
import { AUTH_EVENTS } from '../../../../shared/events/auth/auth-events.constants';
import { COMM_ERROR_CODES } from '../../constants/comm-error-codes.constant';
import { EmailAuditRepository } from '../../repositories/email-audit.repository';
import { EmailService } from '../../services/email.service';
import { TemplateService } from '../../services/template.service';

@Injectable()
export class EmailChangeListener {
  private readonly logger = new Logger(EmailChangeListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    private readonly auditRepository: EmailAuditRepository,
  ) {}

  @OnEvent(AUTH_EVENTS.EMAIL_CHANGE_REQUESTED, { async: true })
  async handle(payload: EmailChangeRequestedPayload): Promise<void> {
    const auditId = crypto.randomUUID();

    const alreadyProcessed = await this.auditRepository.existsByEventId(payload.eventId);
    if (alreadyProcessed) {
      this.logger.debug(
        { commErrorCode: COMM_ERROR_CODES.DUPLICATE_EVENT.code, eventId: payload.eventId },
        COMM_ERROR_CODES.DUPLICATE_EVENT.message,
      );
      return;
    }

    const { subject, html, text } = await this.templateService.render('email-change', payload.locale, {
      newEmail: payload.newEmail,
      verifyUrl: payload.verifyUrl,
      verifyToken: payload.verifyToken,
      expiresAt: payload.expiresAt,
    });

    // Note: email is sent to the NEW email address (the one being verified),
    // not the existing one. This is intentional — verify the new address.
    await this.auditRepository.create({
      id: auditId,
      eventId: payload.eventId,
      eventName: AUTH_EVENTS.EMAIL_CHANGE_REQUESTED,
      userId: payload.userId,
      toEmail: payload.newEmail,
      status: 'PENDING',
      requestId: payload.requestId,
      createdAt: new Date().toISOString(),
    });

    try {
      const result = await this.emailService.send({
        to: payload.newEmail, // send to the NEW address, not the old one
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
        { eventId: payload.eventId, requestId: payload.requestId, newEmail: payload.newEmail },
        'EmailChangeListener: verification email sent to new address',
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
        `EmailChangeListener: FAILED — ${reason}`,
      );
    }
  }
}
