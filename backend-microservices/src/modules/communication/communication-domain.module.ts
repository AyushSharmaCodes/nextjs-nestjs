import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { ContactModule } from './contact/contact.module';
import { NotificationModule } from './notification/notification.module';
import { AlertModule } from './alerts/alert.module';

/**
 * Communication domain module.
 * Consolidates email, contact, notification, and alerts sub-modules.
 */
@Module({
  imports: [EmailModule, ContactModule, NotificationModule, AlertModule],
  exports: [EmailModule, ContactModule, NotificationModule, AlertModule],
})
export class CommunicationDomainModule {}
