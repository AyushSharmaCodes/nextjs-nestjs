/**
 * @file auth/listeners/auth-audit.listener.ts
 *
 * Auth-side audit listener — writes to the legacy OTPEmailHistory table.
 *
 * This listener intentionally listens to the new AUTH_EVENTS constants
 * (not the old AuthEvents strings), so it stays in sync with what
 * better-auth.config.ts actually emits.
 *
 * NOTE: For full email send tracking (SENT/FAILED/provider ID), see
 * EmailAuditRepository used by the Communication module listeners.
 * This listener covers auth-side history only.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { AUTH_EVENTS } from '../../../shared/events/auth/auth-events.constants';
import type {
  UserRegisteredPayload,
  PasswordResetRequestedPayload,
  MagicLinkRequestedPayload,
  OtpRequestedPayload,
  TwoFaCodeRequestedPayload,
} from '../../../shared/events/auth/auth-event-payloads.types';

@Injectable()
export class AuthAuditListener {
  private readonly logger = new Logger(AuthAuditListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(AUTH_EVENTS.USER_REGISTERED, { async: true })
  async handleUserRegistered(event: UserRegisteredPayload): Promise<void> {
    await this.writeOtpHistory(event.email, 'Welcome to MeriGauMata!');
  }

  @OnEvent(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, { async: true })
  async handlePasswordResetRequested(event: PasswordResetRequestedPayload): Promise<void> {
    await this.writeOtpHistory(event.email, 'Reset Your Password');
  }

  @OnEvent(AUTH_EVENTS.MAGIC_LINK_REQUESTED, { async: true })
  async handleMagicLinkRequested(event: MagicLinkRequestedPayload): Promise<void> {
    await this.writeOtpHistory(event.email, 'Your Magic Link Sign-In');
  }

  @OnEvent(AUTH_EVENTS.OTP_REQUESTED, { async: true })
  async handleOtpRequested(event: OtpRequestedPayload): Promise<void> {
    await this.writeOtpHistory(event.email, `Your Verification Code (${event.purpose})`);
  }

  @OnEvent(AUTH_EVENTS.TWO_FA_CODE_REQUESTED, { async: true })
  async handleTwoFaCodeRequested(event: TwoFaCodeRequestedPayload): Promise<void> {
    await this.writeOtpHistory(event.email, 'Your Two-Factor Authentication Code');
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private async writeOtpHistory(email: string, subject: string): Promise<void> {
    try {
      await this.prisma.oTPEmailHistory.create({
        data: {
          email,
          subject,
          body:   '[Auth Audit — see email_audit table for full send status]',
          status: 'PENDING',
        },
      });
      this.logger.debug(`Auth audit logged for ${email}: "${subject}"`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Auth audit write failed for ${email}: ${msg}`);
    }
  }
}
