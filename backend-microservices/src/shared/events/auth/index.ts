/**
 * @file shared/events/auth/index.ts
 *
 * Barrel export for the shared auth events contract.
 *
 * Both modules import from this single path:
 *   - Auth module: to emit typed events
 *   - Communication module: to type-check @OnEvent handler params
 *
 * Never import from auth/ or communication/ here — this is
 * the contract layer, not a domain layer.
 */

export { AUTH_EVENTS } from './auth-events.constants';
export type { AuthEventName } from './auth-events.constants';

export type {
  OtpPurpose,
  AccountLockReason,
  AuthEventPayloadMap,
  UserRegisteredPayload,
  PasswordResetRequestedPayload,
  OtpRequestedPayload,
  MagicLinkRequestedPayload,
  TwoFaCodeRequestedPayload,
  TwoFaEnabledPayload,
  GoogleAccountLinkedPayload,
  AccountLockedPayload,
  AccountUnlockedPayload,
  SuspiciousSessionPayload,
  EmailChangeRequestedPayload,
} from './auth-event-payloads.types';
