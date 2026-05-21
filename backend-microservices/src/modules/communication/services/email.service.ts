/**
 * @file communication/services/email.service.ts
 *
 * Thin orchestration service between listeners and the IEmailProvider.
 *
 * Responsibilities:
 * - Receives a pre-rendered EmailPayload from each listener.
 * - Delegates to the injected IEmailProvider (Resend, SES, SMTP — swappable).
 * - Does NOT manage audit records — that is each listener's responsibility.
 * - Does NOT render templates — that is TemplateService's responsibility.
 *
 * Why NOT embed retry logic here?
 * Retry belongs at the queue layer (BullMQ / SQS DLQ). This service is
 * intentionally thin — callers (listeners) catch errors and update audit.
 * Adding retry here would double the separation-of-concerns violation.
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_PROVIDER_TOKEN } from '../providers/email-provider.interface';
import type { IEmailProvider, EmailPayload, EmailSendResult } from '../providers/email-provider.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_PROVIDER_TOKEN)
    private readonly provider: IEmailProvider,
  ) {}

  /**
   * Sends a pre-rendered email via the injected provider.
   * Throws on delivery failure — callers are responsible for catching
   * and updating the audit record to FAILED.
   */
  async send(payload: EmailPayload): Promise<EmailSendResult> {
    this.logger.debug({
      messageId: payload.messageId,
      to: payload.to,
    }, 'EmailService: dispatching to provider');

    // Let the error propagate — listeners wrap this in try/catch
    return this.provider.send(payload);
  }
}
