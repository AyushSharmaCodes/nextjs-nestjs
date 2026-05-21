import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

const logger = new Logger('GlobalEventDispatcher');

/**
 * Singleton bridge to expose the NestJS EventEmitter2 instance to contexts
 * outside of the NestJS Dependency Injection container (e.g. better-auth).
 */
export class GlobalEventDispatcher {
  private static emitter: EventEmitter2;

  /**
   * Initializes the global dispatcher with the NestJS EventEmitter2 instance.
   * Call this during app/module bootstrap.
   */
  static setEmitter(emitter: EventEmitter2) {
    if (!GlobalEventDispatcher.emitter) {
      GlobalEventDispatcher.emitter = emitter;
      logger.log('Global Event Dispatcher initialized');
    }
  }

  /**
   * Emits an event globally.
   * Logs a warning and fails safely if the emitter hasn't been initialized yet.
   */
  static emit(event: string, payload: any): void {
    if (!GlobalEventDispatcher.emitter) {
      logger.warn(`Failed to emit event '${event}': GlobalEventDispatcher is not initialized yet.`);
      return;
    }
    GlobalEventDispatcher.emitter.emit(event, payload);
  }

  /**
   * Emits an event globally and waits for the listeners to complete.
   */
  static async emitAsync(event: string, payload: any): Promise<void> {
    if (!GlobalEventDispatcher.emitter) {
      logger.warn(`Failed to emitAsync event '${event}': GlobalEventDispatcher is not initialized yet.`);
      return;
    }
    await GlobalEventDispatcher.emitter.emitAsync(event, payload);
  }
}
