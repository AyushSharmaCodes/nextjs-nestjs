/**
 * @file communication/auth-email.module.ts
 *
 * Feature module that wires all typed auth event listeners with their
 * shared services: EmailService, TemplateService, EmailAuditRepository.
 *
 * Email delivery is exclusively handled by SesEmailProvider, which delegates
 * to the infrastructure MailService. Provider mode is controlled by the
 * MAIL_PROVIDER environment variable inside MailService:
 *
 *   MAIL_PROVIDER=ses     → Amazon SES (production)
 *   MAIL_PROVIDER=smtp    → SMTP relay (staging)
 *   MAIL_PROVIDER=console → stdout only (local dev / CI)
 *
 * COUPLING RULE: This module MUST NOT import AuthDomainModule.
 * The ONLY coupling to auth is the shared events contract (constants + types).
 *
 * To add a new listener:
 *   1. Create the file in listeners/auth/
 *   2. Add it to ALL_LISTENERS below
 *   3. Create a matching .hbs template in templates/en/
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { MailModule } from '../../infrastructure/mail/mail.module';
import { MailService } from '../../infrastructure/mail/mail.service';

// Provider abstraction + implementation
import { EMAIL_PROVIDER_TOKEN } from './providers/email-provider.interface';
import { SesEmailProvider } from './providers/ses.provider';

// Services
import { EmailService } from './services/email.service';
import { TemplateService } from './services/template.service';

// Repository
import { EmailAuditRepository } from './repositories/email-audit.repository';

// All auth event listeners
import { UserRegisteredListener } from './listeners/auth/user-registered.listener';
import { EmailVerificationListener } from './listeners/auth/email-verification.listener';
import { PasswordResetListener } from './listeners/auth/password-reset.listener';
import { OtpRequestedListener } from './listeners/auth/otp-requested.listener';
import { MagicLinkListener } from './listeners/auth/magic-link.listener';
import { TwoFaCodeListener } from './listeners/auth/two-fa-code.listener';
import { TwoFaEnabledListener } from './listeners/auth/two-fa-enabled.listener';
import { GoogleLinkedListener } from './listeners/auth/google-linked.listener';
import { AccountLockedListener } from './listeners/auth/account-locked.listener';
import { AccountUnlockedListener } from './listeners/auth/account-unlocked.listener';
import { SuspiciousSessionListener } from './listeners/auth/suspicious-session.listener';
import { EmailChangeListener } from './listeners/auth/email-change.listener';

const ALL_LISTENERS = [
  UserRegisteredListener,
  EmailVerificationListener,
  PasswordResetListener,
  OtpRequestedListener,
  MagicLinkListener,
  TwoFaCodeListener,
  TwoFaEnabledListener,
  GoogleLinkedListener,
  AccountLockedListener,
  AccountUnlockedListener,
  SuspiciousSessionListener,
  EmailChangeListener,
];

@Module({
  imports: [
    PrismaModule,   // PrismaService → EmailAuditRepository
    MailModule,     // MailService → SesEmailProvider
    ConfigModule,   // ConfigService → TemplateService (FRONTEND_URL)
  ],
  providers: [
    // ─── Email Provider ───────────────────────────────────────────────────────
    // SesEmailProvider delegates to MailService which reads MAIL_PROVIDER
    // at startup. Switching SES ↔ SMTP ↔ console requires no code change —
    // only a MAIL_PROVIDER env var change + restart.
    {
      provide: EMAIL_PROVIDER_TOKEN,
      useFactory: (mailService: MailService): SesEmailProvider =>
        new SesEmailProvider(mailService),
      inject: [MailService],
    },

    // ─── Core services ────────────────────────────────────────────────────────
    EmailService,
    TemplateService,
    EmailAuditRepository,

    // ─── All listeners ────────────────────────────────────────────────────────
    ...ALL_LISTENERS,
  ],
  exports: [
    EmailService,
    TemplateService,
    EmailAuditRepository,
  ],
})
export class AuthEmailModule {}
