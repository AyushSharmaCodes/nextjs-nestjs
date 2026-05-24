/**
 * @file auth/events/auth-event.emitter.ts
 *
 * The ONLY class in the Auth module that touches EventEmitter2.
 *
 * Design decisions:
 * - Single responsibility: wraps the raw EventEmitter2 with compile-time
 *   typed overloads so callers can never emit the wrong payload shape.
 * - `emit()` is intentionally `void`. AuthService must NEVER await email
 *   delivery — fire-and-forget is a first-class contract here.
 * - Error isolation: if the event bus itself throws (e.g. a synchronous
 *   listener bugs out), we catch and log it but NEVER re-throw.
 *   Auth HTTP response has already committed — email failure must not
 *   retroactively break the auth response.
 *
 * Anti-patterns explicitly avoided:
 * - No `emitAsync()` — that would make AuthService await the listeners.
 * - No direct EventEmitter2 injection into AuthService — keeps event
 *   coupling centralized in this file only.
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { AuthEventPayloadMap } from '../../../shared/events/auth/auth-event-payloads.types';
import type { AuthEventName } from '../../../shared/events/auth/auth-events.constants';

@Injectable()
export class AuthEventEmitter {
  private readonly logger = new Logger(AuthEventEmitter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emits a typed auth event onto the NestJS EventEmitter2 bus.
   *
   * Generic constraints:
   *   K extends AuthEventName  →  event name must be a known constant
   *   AuthEventPayloadMap[K]   →  payload type is inferred from event name
   *
   * At the call site, `satisfies` enforces that every field is provided:
   *   this.authEventEmitter.emit(AUTH_EVENTS.OTP_REQUESTED, {
   *     ...fields
   *   } satisfies OtpRequestedPayload);
   *
   * @param event   - Event name from AUTH_EVENTS constants
   * @param payload - Strictly typed payload for that event
   */
  emit<K extends AuthEventName>(event: K, payload: AuthEventPayloadMap[K]): void {
    try {
      // EventEmitter2's synchronous emit — listeners run in the same microtask
      // queue but @OnEvent({ async: true }) listeners are wrapped in setImmediate,
      // so they won't block the call stack here.
      this.eventEmitter.emit(event, payload);
    } catch (err: unknown) {
      // Defensive catch: a misbehaving synchronous listener could throw here.
      // We log it with full context but NEVER propagate — Auth HTTP response wins.
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        {
          event,
          // Never log the full payload — it may contain otpCode / resetToken
          eventId: (payload as { eventId: string }).eventId,
          userId: (payload as { userId: string }).userId,
          requestId: (payload as { requestId: string }).requestId,
          err,
        },
        `AuthEventEmitter: failed to emit '${event}': ${message}`,
      );
    }
  }
}
