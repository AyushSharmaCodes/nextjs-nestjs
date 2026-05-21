/**
 * @file communication/entities/email-audit.entity.ts
 *
 * Domain entity representing an email audit record.
 * This is the mapped type — never expose raw Prisma types outside the repository.
 *
 * All dates are ISO 8601 strings (not Date objects) to avoid timezone
 * serialization bugs when passing across module boundaries.
 */

import type { EmailStatus } from '../types/email.types';
import type { UserId } from '../../../shared/types/index';

export interface EmailAuditEntity {
  readonly id:                string;
  readonly eventId:           string;      // idempotency key
  readonly eventName:         string;      // AUTH_EVENTS constant
  readonly userId:            UserId;
  readonly toEmail:           string;
  readonly status:            EmailStatus;
  readonly providerMessageId: string | null;
  readonly failReason:        string | null;
  readonly requestId:         string;
  readonly sentAt:            string | null;   // ISO 8601
  readonly failedAt:          string | null;   // ISO 8601
  readonly createdAt:         string;          // ISO 8601
  readonly updatedAt:         string;          // ISO 8601
}
