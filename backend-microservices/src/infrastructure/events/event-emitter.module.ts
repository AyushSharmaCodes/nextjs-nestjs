import { Module, Global, OnModuleInit } from '@nestjs/common';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { GlobalEventDispatcher } from './global-event-dispatcher';

/**
 * Internal event-driven communication module.
 * Replaces gRPC inter-service communication with in-process EventEmitter.
 *
 * Usage:
 * - Emit: this.eventEmitter.emit(DomainEvents.ORDER.CREATED, payload)
 * - Listen: @OnEvent(DomainEvents.ORDER.CREATED) handleOrderCreated(payload)
 */
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Use wildcards for flexible event listening
      wildcard: true,
      // Delimiter for namespaced events (e.g., 'order.created')
      delimiter: '.',
      // New listener warning threshold
      maxListeners: 20,
      // Show event name in memory leak messages
      verboseMemoryLeak: true,
      // Ignore errors on unhandled events
      ignoreErrors: false,
    }),
  ],
})
export class AppEventEmitterModule implements OnModuleInit {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  onModuleInit() {
    GlobalEventDispatcher.setEmitter(this.eventEmitter);
  }
}
