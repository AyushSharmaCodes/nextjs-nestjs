/**
 * @file communication/mappers/email-audit.mapper.ts
 *
 * Maps raw Prisma EmailAudit records to the domain EmailAuditEntity.
 *
 * Purpose:
 * - Prisma types must NEVER escape the repository layer.
 * - This mapper is the single translation point: Prisma → domain entity.
 * - All Date fields are converted to ISO 8601 strings here.
 * - userId is cast to branded UserId (it's sourced from DB so safe).
 *
 * Note on `EmailStatus` cast:
 * Prisma's generated `EmailStatus` enum string values match our domain
 * `EmailStatus` type exactly. The `as EmailStatus` cast is intentional
 * and safe — if Prisma enum changes, the mapper will break visibly here.
 */

import type { EmailAudit } from '@prisma/client';
import type { EmailAuditEntity } from '../entities/email-audit.entity';
import type { EmailStatus } from '../types/email.types';
import { toUserId } from '../../../shared/types/index';

export class EmailAuditMapper {
  static toDomain(raw: EmailAudit): EmailAuditEntity {
    return {
      id:                raw.id,
      eventId:           raw.eventId,
      eventName:         raw.eventName,
      userId:            toUserId(raw.userId),
      toEmail:           raw.toEmail,
      status:            raw.status as EmailStatus,
      providerMessageId: raw.providerMessageId ?? null,
      failReason:        raw.failReason ?? null,
      requestId:         raw.requestId,
      sentAt:            raw.sentAt ? raw.sentAt.toISOString() : null,
      failedAt:          raw.failedAt ? raw.failedAt.toISOString() : null,
      createdAt:         raw.createdAt.toISOString(),
      updatedAt:         raw.updatedAt.toISOString(),
    };
  }

  static toDomainList(raws: EmailAudit[]): EmailAuditEntity[] {
    return raws.map(EmailAuditMapper.toDomain);
  }
}
