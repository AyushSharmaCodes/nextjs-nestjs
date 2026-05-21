/**
 * @file communication/providers/ses.provider.ts
 *
 * Email provider implementation backed by the infrastructure MailService.
 * Supports all three deployment modes via the MAIL_PROVIDER env var:
 *
 *   MAIL_PROVIDER=ses     → Amazon SES (production)
 *   MAIL_PROVIDER=smtp    → SMTP relay (staging / local relay)
 *   MAIL_PROVIDER=console → Logs to stdout only (local dev / test)
 *
 * The MailService already handles provider selection internally —
 * this class is a thin adapter that normalises its output to the
 * IEmailProvider contract so listeners are provider-agnostic.
 *
 * Trade-off: MailService currently swallows send errors internally and
 * does not expose the SES MessageId. This is acceptable for now —
 * a providerMessageId of `ses-{eventId}` is still unique and traceable.
 * Upgrade MailService to return the raw SES response if strict
 * provider-level deduplication is required in future.
 */

import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../../infrastructure/mail/mail.service';
import type {
  IEmailProvider,
  EmailPayload,
  EmailSendResult,
} from './email-provider.interface';
import { COMM_ERROR_CODES } from '../constants/comm-error-codes.constant';

@Injectable()
export class SesEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SesEmailProvider.name);

  constructor(private readonly mailService: MailService) {}

  async send(payload: EmailPayload): Promise<EmailSendResult> {
    try {
      await this.mailService.sendMail({
        to:      payload.to,
        subject: payload.subject,
        html:    payload.html,
        text:    payload.text,
      });

      return {
        // Synthetic message ID — unique per event, fully traceable via eventId
        // TODO: upgrade MailService to expose the raw SES MessageId
        providerMessageId: `ses-${payload.messageId}`,
        acceptedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        {
          commErrorCode: COMM_ERROR_CODES.PROVIDER_REJECTED.code,
          messageId:     payload.messageId,
          to:            payload.to,
          reason,
        },
        `SesEmailProvider: send failed — ${reason}`,
      );
      throw new Error(`${COMM_ERROR_CODES.PROVIDER_REJECTED.code}: ${reason}`);
    }
  }
}
