/**
 * @file communication/listeners/auth/otp-requested.listener.ts
 * Handles AUTH_EVENTS.OTP_REQUESTED — sends OTP verification code email.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { OtpRequestedPayload } from '../../../../shared/events/auth/auth-event-payloads.types';
import { AUTH_EVENTS } from '../../../../shared/events/auth/auth-events.constants';
import { COMM_ERROR_CODES } from '../../constants/comm-error-codes.constant';
import { EmailAuditRepository } from '../../repositories/email-audit.repository';
import { EmailService } from '../../services/email.service';
import { TemplateService } from '../../services/template.service';

@Injectable()
export class OtpRequestedListener {
  private readonly logger = new Logger(OtpRequestedListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    private readonly auditRepository: EmailAuditRepository,
  ) {}

  @OnEvent(AUTH_EVENTS.OTP_REQUESTED, { async: true })
  async handle(payload: OtpRequestedPayload): Promise<void> {
    this.logger.log(`OtpRequestedListener: Event received for email="${payload.email}", purpose="${payload.purpose}"`);
    const auditId = crypto.randomUUID();

    let auditCreated = false;
    try {
      const alreadyProcessed = await this.auditRepository.existsByEventId(payload.eventId);
      if (alreadyProcessed) {
        this.logger.debug(
          { commErrorCode: COMM_ERROR_CODES.DUPLICATE_EVENT.code, eventId: payload.eventId },
          COMM_ERROR_CODES.DUPLICATE_EVENT.message,
        );
        return;
      }

      this.logger.log(`OtpRequestedListener: Rendering template and creating audit record for email="${payload.email}"`);
      const { subject, html, text } = await this.templateService.render('otp', payload.locale, {
        otpCode: payload.otpCode,
        expiresAt: payload.expiresAt,
        purpose: payload.purpose,
        attemptCount: payload.attemptCount,
      });

      await this.auditRepository.create({
        id: auditId,
        eventId: payload.eventId,
        eventName: AUTH_EVENTS.OTP_REQUESTED,
        userId: payload.userId,
        toEmail: payload.email,
        status: 'PENDING',
        requestId: payload.requestId,
        createdAt: new Date().toISOString(),
      });
      auditCreated = true;

      this.logger.log(`OtpRequestedListener: Dispatching OTP email via EmailService to "${payload.email}"`);
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
        { eventId: payload.eventId, requestId: payload.requestId, purpose: payload.purpose },
        `OtpRequestedListener: OTP email successfully sent to "${payload.email}"`,
      );
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : 'Unknown exception';
      
      // Attempt to update audit status to FAILED if the audit record was successfully created
      if (auditCreated) {
        try {
          await this.auditRepository.updateStatus(auditId, {
            status: 'FAILED',
            failReason: reason,
            failedAt: new Date().toISOString(),
          });
        } catch (auditErr: unknown) {
          this.logger.warn(
            `OtpRequestedListener: Could not update audit status to FAILED: ${
              auditErr instanceof Error ? auditErr.message : String(auditErr)
            }`
          );
        }
      }

      this.logger.error(
        {
          commErrorCode: COMM_ERROR_CODES.PROVIDER_REJECTED.code,
          eventId: payload.eventId,
          requestId: payload.requestId,
          userId: payload.userId,
          purpose: payload.purpose,
          auditId,
          reason,
        },
        `OtpRequestedListener: Failed to process OTP event — ${reason}`,
      );
    }
  }
}
