/**
 * @file communication/communication-domain.module.ts
 *
 * Communication domain module.
 * Consolidates email, contact, notification, alerts, and the new
 * auth-event-driven email listeners (AuthEmailModule).
 *
 * COUPLING RULE: This module MUST NOT import AuthDomainModule.
 */

import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { ContactModule } from './contact/contact.module';
import { NotificationModule } from './notification/notification.module';
import { AlertModule } from './alerts/alert.module';
// Production-grade event-driven auth email layer
import { AuthEmailModule } from './auth-email.module';

@Module({
  imports: [
    EmailModule,
    ContactModule,
    NotificationModule,
    AlertModule,
    AuthEmailModule,  // registers all 11 typed listeners + audit infrastructure
  ],
  exports: [
    EmailModule,
    ContactModule,
    NotificationModule,
    AlertModule,
    AuthEmailModule,
  ],
})
export class CommunicationDomainModule {}
