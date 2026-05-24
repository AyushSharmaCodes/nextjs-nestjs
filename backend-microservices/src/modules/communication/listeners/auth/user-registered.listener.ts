/**
 * @file communication/listeners/auth/user-registered.listener.ts
 *
 * Handles AUTH_EVENTS.USER_REGISTERED — sends the welcome email.
 *
 * Pattern applied to all listeners:
 *  1. Idempotency check via eventId (skip if already in audit table)
 *  2. Render i18n template (locale from payload)
 *  3. Write PENDING audit record
 *  4. Send via EmailService → IEmailProvider
 *  5. Update audit → SENT
 *  6. On any error → update audit → FAILED, log structured error
 *  7. NEVER throw — email failure must not crash the auth HTTP response
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { UserRegisteredPayload } from '../../../../shared/events/auth/auth-event-payloads.types';
import { AUTH_EVENTS } from '../../../../shared/events/auth/auth-events.constants';
import { COMM_ERROR_CODES } from '../../constants/comm-error-codes.constant';
import { EmailAuditRepository } from '../../repositories/email-audit.repository';
import { EmailService } from '../../services/email.service';
import { TemplateService } from '../../services/template.service';

@Injectable()
export class UserRegisteredListener {
  private readonly logger = new Logger(UserRegisteredListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    private readonly auditRepository: EmailAuditRepository,
  ) {}

  @OnEvent(AUTH_EVENTS.USER_REGISTERED, { async: true })
  async handle(payload: UserRegisteredPayload): Promise<void> {
    const auditId = crypto.randomUUID();

    // 1. Idempotency
    const alreadyProcessed = await this.auditRepository.existsByEventId(payload.eventId);
    if (alreadyProcessed) {
      this.logger.debug(
        { commErrorCode: COMM_ERROR_CODES.DUPLICATE_EVENT.code, eventId: payload.eventId },
        COMM_ERROR_CODES.DUPLICATE_EVENT.message,
      );
      return;
    }

    // 2. Render template
    const { subject, html, text } = await this.templateService.render('welcome', payload.locale, {
      displayName: payload.displayName,
      authMethod: payload.authMethod,
    });

    // 3. Pending audit
    await this.auditRepository.create({
      id: auditId,
      eventId: payload.eventId,
      eventName: AUTH_EVENTS.USER_REGISTERED,
      userId: payload.userId,
      toEmail: payload.email,
      status: 'PENDING',
      requestId: payload.requestId,
      createdAt: new Date().toISOString(),
    });

    // 4-5. Send + update SENT
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
        { eventId: payload.eventId, requestId: payload.requestId, to: payload.email },
        'UserRegisteredListener: welcome email sent',
      );
    } catch (err: unknown) {
      // 6. FAILED — never re-throw
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
          toEmail: payload.email,
          auditId,
          reason,
        },
        `UserRegisteredListener: welcome email FAILED — ${reason}`,
      );
    }
  }
}
