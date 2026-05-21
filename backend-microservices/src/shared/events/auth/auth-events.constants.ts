/**
 * Auth Event Name Constants
 *
 * All auth-related events are defined here. The Communication module
 * subscribes to these events to send email notifications.
 * Auth module emits these events after successful operations.
 *
 * @example
 * // In AuthService:
 * authEventEmitter.emit(AUTH_EVENTS.USER_REGISTERED, payload);
 *
 * // In CommunicationModule listener:
 * @OnEvent(AUTH_EVENTS.USER_REGISTERED)
 * handleUserRegistered(payload: UserRegisteredPayload) { ... }
 */

export const AUTH_EVENTS = {
  USER_REGISTERED: 'auth.user.registered',

  PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',

  EMAIL_VERIFICATION_REQUESTED: 'auth.email.verification.requested',

  OTP_REQUESTED: 'auth.otp.requested',

  MAGIC_LINK_REQUESTED: 'auth.magic_link.requested',

  TWO_FA_ENABLED: 'auth.2fa.enabled',

  TWO_FA_CODE_REQUESTED: 'auth.2fa.code.requested',

  GOOGLE_ACCOUNT_LINKED: 'auth.google.account.linked',

  ACCOUNT_LOCKED: 'auth.account.locked',

  ACCOUNT_UNLOCKED: 'auth.account.unlocked',

  SESSION_SUSPICIOUS: 'auth.session.suspicious',

  EMAIL_CHANGE_REQUESTED: 'auth.email.change.requested',
} as const;

export type AuthEventName = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];

/**
 * Utility type: make all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
