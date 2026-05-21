/**
 * @file communication/constants/comm-error-codes.constant.ts
 *
 * Internal error codes for the Communication module.
 *
 * IMPORTANT: These are NEVER returned to API clients.
 * They are for structured logging and monitoring only.
 * Listeners catch all errors and log them with these codes — they NEVER
 * throw HttpExceptions or propagate errors up to the auth HTTP response.
 */

export const COMM_ERROR_CODES = {
  /** Handlebars template file not found for the requested locale or 'en' fallback. */
  TEMPLATE_NOT_FOUND: {
    code: 'COMM_001',
    httpStatus: 500,
    message: 'Email template file not found',
  },
  /** Handlebars render threw — likely a bad variable reference in the template. */
  TEMPLATE_RENDER_FAILED: {
    code: 'COMM_002',
    httpStatus: 500,
    message: 'Email template render failed',
  },
  /** Email provider (Resend / SES / SMTP) rejected the send request. */
  PROVIDER_REJECTED: {
    code: 'COMM_003',
    httpStatus: 502,
    message: 'Email provider rejected the send request',
  },
  /** Email provider request timed out. */
  PROVIDER_TIMEOUT: {
    code: 'COMM_004',
    httpStatus: 504,
    message: 'Email provider request timed out',
  },
  /** Prisma write to email_audit table failed. */
  AUDIT_WRITE_FAILED: {
    code: 'COMM_005',
    httpStatus: 500,
    message: 'Failed to write email audit record',
  },
  /** eventId already present in email_audit — idempotency guard triggered. */
  DUPLICATE_EVENT: {
    code: 'COMM_006',
    httpStatus: 200,
    message: 'Event already processed — skipping (idempotency)',
  },
  /** Requested locale template missing; 'en' fallback was used. */
  LOCALE_FALLBACK_USED: {
    code: 'COMM_007',
    httpStatus: 200,
    message: "Locale template not found — fell back to 'en'",
  },
} as const;

/** Type of any COMM error code key. */
export type CommErrorCode = keyof typeof COMM_ERROR_CODES;
