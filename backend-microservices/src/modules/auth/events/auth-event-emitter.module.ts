/**
 * @file auth/events/auth-event-emitter.module.ts
 *
 * Standalone module that provides and exports AuthEventEmitter.
 *
 * Why a separate module?
 *   AuthDomainModule imports SessionModule (for SuspiciousSessionService).
 *   SuspiciousSessionService injects AuthEventEmitter.
 *   If AuthEventEmitter lived only in AuthDomainModule, SessionModule would
 *   need to import AuthDomainModule — creating a circular dependency.
 *
 *   Extracting AuthEventEmitter into its own module breaks the cycle:
 *     AuthEventEmitterModule  ←  AuthDomainModule
 *     AuthEventEmitterModule  ←  SessionModule
 *
 *   Both modules import AuthEventEmitterModule; neither imports the other.
 *
 * AppEventEmitterModule is @Global(), so EventEmitter2 is available here
 * without an explicit import.
 */

import { Module } from '@nestjs/common';
import { AuthEventEmitter } from './auth-event.emitter';

@Module({
  providers: [AuthEventEmitter],
  exports:   [AuthEventEmitter],
})
export class AuthEventEmitterModule {}
