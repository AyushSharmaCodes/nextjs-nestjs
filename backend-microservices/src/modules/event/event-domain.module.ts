import { Module } from '@nestjs/common';
import { EventModule } from './events/event.module';
import { DonationModule } from './donations/donation.module';

/**
 * Event domain module (religious events, not system events).
 * Consolidates events and donations sub-modules.
 */
@Module({
  imports: [EventModule, DonationModule],
  exports: [EventModule, DonationModule],
})
export class EventDomainModule {}
