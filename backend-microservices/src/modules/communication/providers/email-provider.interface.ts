/**
 * @file communication/providers/email-provider.interface.ts
 *
 * The abstraction layer between the Communication module and the actual
 * email delivery SDK (Resend, SES, SMTP, etc.).
 *
 * Swap rule: change the provider by updating ONE useClass/useFactory line
 * in CommunicationModule. Never change listeners or EmailService.
 *
 * EMAIL_PROVIDER_TOKEN is a Symbol (not a string) to avoid accidental
 * collision with other tokens in the NestJS DI container.
 */

/** Injection token — inject with @Inject(EMAIL_PROVIDER_TOKEN) */
export const EMAIL_PROVIDER_TOKEN = Symbol('EMAIL_PROVIDER');

/** The payload handed from EmailService → IEmailProvider.send(). */
export interface EmailPayload {
  readonly to:        string;
  readonly subject:   string;
  readonly html:      string;
  readonly text:      string;      // plain-text fallback (required, not optional)
  readonly replyTo?:  string;
  /** eventId passed through for provider-level deduplication. */
  readonly messageId: string;
}

/** What the provider returns on success. */
export interface EmailSendResult {
  /** Provider-assigned message ID for tracking (Resend ID, SES MessageId, etc.). */
  readonly providerMessageId: string;
  readonly acceptedAt:        string;   // ISO 8601
}

/** Interface every email provider must implement. */
export interface IEmailProvider {
  send(payload: EmailPayload): Promise<EmailSendResult>;
}
