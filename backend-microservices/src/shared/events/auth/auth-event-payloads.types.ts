/**
 * @file shared/events/auth/auth-event-payloads.types.ts
 *
 * Strictly typed readonly interfaces for every auth event payload.
 *
 * Design notes:
 * - All interfaces are `readonly` — events are immutable value objects.
 * - `BaseAuthEventPayload` carries trace fields (eventId, requestId, locale)
 *   that every listener needs for idempotency, i18n, and distributed tracing.
 * - `AuthEventPayloadMap` is a discriminated lookup — allows the generic
 *   AuthEventEmitter.emit<K>() to enforce payload shape at compile time.
 * - `OtpPurpose` and `AccountLockReason` are local enums here, not imported
 *   from auth module, to avoid coupling Communication ← Auth module.
 */

import type { UserId, SessionId, LocaleCode } from '../../types/index';
import type { AUTH_EVENTS } from './auth-events.constants';
import type {
  DeviceType,
  SessionRiskLevel,
  SuspicionReason,
  IpAddress,
  CountryCode,
  DeviceFingerprint,
} from '../../types/device.types';

// ─────────────────────────────────────────────────────────────────────────────
// Domain enums (shared — neither Auth nor Communication module owns these)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reason an OTP was generated.
 * Keep in sync with src/common/types `OtpPurpose`.
 */
export type OtpPurpose =
  | 'LOGIN'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_DELETION'
  | 'EMAIL_VERIFICATION'
  | 'TWO_FA_SETUP';

/**
 * Reason an account was locked.
 * Drives the body copy in the account-locked email template.
 */
export type AccountLockReason =
  | 'TOO_MANY_FAILED_LOGINS'
  | 'SUSPICIOUS_ACTIVITY'
  | 'ADMIN_ACTION'
  | 'POLICY_VIOLATION';

// ─────────────────────────────────────────────────────────────────────────────
// Base payload — every auth event extends this
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fields required on every auth event payload.
 *
 * - `eventId`     — UUID v4, used as idempotency key in EmailAudit table.
 * - `requestId`   — Trace ID from originating HTTP request (AsyncLocalStorage).
 *                   Flows through listener → audit record → provider log.
 * - `locale`      — Resolved by Auth from Accept-Language header.
 *                   Communication module NEVER touches HTTP context.
 * - `triggeredAt` — ISO 8601 timestamp of the moment the event was emitted.
 */
interface BaseAuthEventPayload {
  readonly eventId:      string;     // UUID v4 — idempotency key
  readonly userId:       UserId;
  readonly email:        string;
  readonly locale:       LocaleCode; // drives i18n template selection
  readonly triggeredAt:  string;     // ISO 8601
  readonly requestId:    string;     // distributed trace ID
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-event payload interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserRegisteredPayload extends BaseAuthEventPayload {
  readonly displayName: string;
  /** Auth method used to create the account — drives template variant. */
  readonly authMethod:  'email_password' | 'google' | 'magic_link';
}

export interface PasswordResetRequestedPayload extends BaseAuthEventPayload {
  readonly resetUrl:    string;  // full Better Auth callback URL — preferred over rebuilding
  readonly resetToken:  string;  // included in reset link URL — DO NOT log
  readonly expiresAt:   string;  // ISO 8601 — shown in email body
  readonly ipAddress:   string;  // security context for the email body
  readonly userAgent:   string;  // security context for the email body
}

export interface EmailVerificationRequestedPayload extends BaseAuthEventPayload {
  readonly verifyUrl:   string;  // full Better Auth callback URL — preferred over rebuilding
  readonly verifyToken: string;  // included in verify link URL — DO NOT log
  readonly expiresAt:   string;  // ISO 8601
}

export interface OtpRequestedPayload extends BaseAuthEventPayload {
  /**
   * Plain OTP code — only in transit via the in-process event bus.
   * DB already has the hashed version. Never log this field.
   */
  readonly otpCode:      string;
  readonly purpose:      OtpPurpose;
  readonly expiresAt:    string;     // ISO 8601
  readonly attemptCount: number;     // used for escalating urgency in template
}

export interface MagicLinkRequestedPayload extends BaseAuthEventPayload {
  readonly magicLinkUrl: string;   // full URL — DO NOT log
  readonly expiresAt:    string;   // ISO 8601
}

export interface TwoFaCodeRequestedPayload extends BaseAuthEventPayload {
  readonly totpCode:   string;   // time-based OTP code — DO NOT log
  readonly expiresAt:  string;   // ISO 8601
  /** Last 4 chars of userAgent — device hint without leaking full UA. */
  readonly deviceHint: string;
}

export interface TwoFaEnabledPayload extends BaseAuthEventPayload {
  readonly enabledAt: string;    // ISO 8601 — for confirmation email body
}

export interface GoogleAccountLinkedPayload extends BaseAuthEventPayload {
  readonly googleEmail: string;  // Google account email (may differ from primary)
  readonly linkedAt:    string;  // ISO 8601
}

export interface AccountLockedPayload extends BaseAuthEventPayload {
  readonly reason:         AccountLockReason;
  readonly lockedUntil:    string;   // ISO 8601 — shown in email
  readonly failedAttempts: number;
}

export interface AccountUnlockedPayload extends BaseAuthEventPayload {
  /** Who/what triggered the unlock — drives template copy. */
  readonly unlockedBy: 'system' | 'admin' | 'timer';
}

export interface SuspiciousSessionPayload extends BaseAuthEventPayload {
  // Session identification
  readonly sessionId:        SessionId;

  // Geo context
  readonly ipAddress:        IpAddress;
  readonly city:             string;         // 'Unknown' if GeoIP failed
  readonly region:           string;         // 'Unknown' if GeoIP failed
  readonly country:          CountryCode;    // 'XX' if GeoIP failed
  readonly latitude:         number | null;
  readonly longitude:        number | null;

  // Device context
  readonly deviceType:       DeviceType;
  readonly os:               string;
  readonly osVersion:        string;
  readonly browser:          string;
  readonly browserVersion:   string;
  readonly fingerprint:      DeviceFingerprint;

  // Risk classification
  readonly riskLevel:        SessionRiskLevel;
  readonly suspicionReasons: ReadonlyArray<SuspicionReason>;

  // Timing
  readonly signedInAt:       string;         // ISO 8601
}

export interface EmailChangeRequestedPayload extends BaseAuthEventPayload {
  readonly newEmail:    string;   // destination address for the verify email
  readonly verifyUrl?:  string;   // full callback URL if provided by the auth provider
  readonly verifyToken: string;   // included in verify link — DO NOT log
  readonly expiresAt:   string;   // ISO 8601
}

// ─────────────────────────────────────────────────────────────────────────────
// Discriminated map — ties event names to payload types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps every AUTH_EVENTS constant to its typed payload interface.
 *
 * Usage:
 *   emit<K extends AuthEventName>(event: K, payload: AuthEventPayloadMap[K])
 *
 * This gives the compiler an exhaustive check — if a new event is added to
 * AUTH_EVENTS but not to this map, the generic emit() will error at the
 * call site.
 */
export type AuthEventPayloadMap = {
  [AUTH_EVENTS.USER_REGISTERED]:          UserRegisteredPayload;
  [AUTH_EVENTS.PASSWORD_RESET_REQUESTED]: PasswordResetRequestedPayload;
  [AUTH_EVENTS.EMAIL_VERIFICATION_REQUESTED]: EmailVerificationRequestedPayload;
  [AUTH_EVENTS.OTP_REQUESTED]:            OtpRequestedPayload;
  [AUTH_EVENTS.MAGIC_LINK_REQUESTED]:     MagicLinkRequestedPayload;
  [AUTH_EVENTS.TWO_FA_CODE_REQUESTED]:    TwoFaCodeRequestedPayload;
  [AUTH_EVENTS.TWO_FA_ENABLED]:           TwoFaEnabledPayload;
  [AUTH_EVENTS.GOOGLE_ACCOUNT_LINKED]:    GoogleAccountLinkedPayload;
  [AUTH_EVENTS.ACCOUNT_LOCKED]:           AccountLockedPayload;
  [AUTH_EVENTS.ACCOUNT_UNLOCKED]:         AccountUnlockedPayload;
  [AUTH_EVENTS.SESSION_SUSPICIOUS]:       SuspiciousSessionPayload;
  [AUTH_EVENTS.EMAIL_CHANGE_REQUESTED]:   EmailChangeRequestedPayload;
};
