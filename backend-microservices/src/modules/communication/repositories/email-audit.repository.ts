/**
 * @file communication/repositories/email-audit.repository.ts
 *
 * Prisma-backed repository for EmailAudit records.
 *
 * Contract:
 * - All inputs are typed DTOs; all outputs are typed domain entities.
 * - Zero raw Prisma types escape this class.
 * - existsByEventId() is the idempotency guard — called before any listener
 *   performs real work.
 *
 * Error handling:
 * - Prisma errors are caught and re-thrown with a structured message
 *   (COMM_005) so listeners can log them with the correct error code.
 * - Repository methods NEVER throw NestJS HttpExceptions — they are not
 *   in the HTTP request pipeline.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { EmailAuditMapper } from '../mappers/email-audit.mapper';
import type { EmailAuditEntity } from '../entities/email-audit.entity';
import type { CreateEmailAuditDto, UpdateEmailStatusDto } from '../dto/email-audit.dto';
import type { UserId } from '../../../shared/types/index';
import { COMM_ERROR_CODES } from '../constants/comm-error-codes.constant';

@Injectable()
export class EmailAuditRepository {
  private readonly logger = new Logger(EmailAuditRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if an event with this eventId has already been processed.
   * Used as idempotency guard at the start of every listener.
   */
  async existsByEventId(eventId: string): Promise<boolean> {
    try {
      const record = await this.prisma.emailAudit.findUnique({
        where: { eventId },
        select: { id: true },
      });
      return record !== null;
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { commErrorCode: COMM_ERROR_CODES.AUDIT_WRITE_FAILED.code, eventId, reason },
        `EmailAuditRepository.existsByEventId failed: ${reason}`,
      );
      // On DB error, treat as "not processed" to allow re-processing.
      // This is the safer failure mode — worst case we send a duplicate email,
      // not silently skip a required send.
      return false;
    }
  }

  /** Create a PENDING audit record before sending the email. */
  async create(dto: CreateEmailAuditDto): Promise<EmailAuditEntity> {
    try {
      const raw = await this.prisma.emailAudit.create({
        data: {
          id: dto.id,
          eventId: dto.eventId,
          eventName: dto.eventName,
          userId: dto.userId,
          toEmail: dto.toEmail,
          status: dto.status,
          requestId: dto.requestId,
        },
      });
      return EmailAuditMapper.toDomain(raw);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { commErrorCode: COMM_ERROR_CODES.AUDIT_WRITE_FAILED.code, eventId: dto.eventId, reason },
        `EmailAuditRepository.create failed: ${reason}`,
      );
      throw new Error(`${COMM_ERROR_CODES.AUDIT_WRITE_FAILED.code}: ${reason}`);
    }
  }

  /** Update the audit record to SENT or FAILED after the send attempt. */
  async updateStatus(id: string, dto: UpdateEmailStatusDto): Promise<void> {
    try {
      await this.prisma.emailAudit.update({
        where: { id },
        data: {
          status: dto.status,
          providerMessageId: dto.providerMessageId ?? undefined,
          failReason: dto.failReason ?? undefined,
          sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,
          failedAt: dto.failedAt ? new Date(dto.failedAt) : undefined,
        },
      });
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { commErrorCode: COMM_ERROR_CODES.AUDIT_WRITE_FAILED.code, auditId: id, status: dto.status, reason },
        `EmailAuditRepository.updateStatus failed: ${reason}`,
      );
      // Don't re-throw — audit update failure must not crash the listener
    }
  }

  /** Find all email audit records for a given user (for support/compliance). */
  async findByUserId(userId: UserId): Promise<EmailAuditEntity[]> {
    const records = await this.prisma.emailAudit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return EmailAuditMapper.toDomainList(records);
  }

  /**
   * Find all FAILED records created after the given ISO 8601 timestamp.
   * Used by monitoring/alerting jobs to detect delivery failures.
   */
  async findFailedSince(since: string): Promise<EmailAuditEntity[]> {
    const records = await this.prisma.emailAudit.findMany({
      where: {
        status: 'FAILED',
        createdAt: { gte: new Date(since) },
      },
      orderBy: { createdAt: 'asc' },
    });
    return EmailAuditMapper.toDomainList(records);
  }
}
