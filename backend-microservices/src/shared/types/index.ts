/**
 * @file shared/types/index.ts
 *
 * Cross-module branded primitive types.
 *
 * Branded types give compile-time proof that IDs are never accidentally
 * swapped. Both the Auth emitter and the Communication listener import
 * from here — the ONLY shared type dependency between the two modules.
 *
 * Locale codes drive the i18n template selection in CommunicationModule.
 * Auth resolves it from Accept-Language; Communication never touches HTTP.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Branded ID types
// ─────────────────────────────────────────────────────────────────────────────

/** A string validated as a real user primary key (DB-sourced). */
export type UserId = string & { readonly _brand: 'UserId' };

/** A string validated as a real session primary key (DB-sourced). */
export type SessionId = string & { readonly _brand: 'SessionId' };

// ─────────────────────────────────────────────────────────────────────────────
// i18n locale codes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supported locale codes for email templates.
 * Keep in sync with src/infrastructure/i18n supported languages.
 */
export type LocaleCode = 'en' | 'hi' | 'ta' | 'te';

/** All supported locale codes as a readonly set for runtime narrowing. */
export const LOCALE_CODES: ReadonlySet<string> = new Set<LocaleCode>([
  'en',
  'hi',
  'ta',
  'te',
]);

/** Type-guard: narrows an unknown string to LocaleCode. */
export function isLocaleCode(value: string | undefined | null): value is LocaleCode {
  return typeof value === 'string' && LOCALE_CODES.has(value);
}

/** Falls back to 'en' if the value is not a known locale. */
export function toLocaleCode(value: string | undefined | null): LocaleCode {
  return isLocaleCode(value) ? value : 'en';
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe constructors — call only after value comes from DB / auth layer
// ─────────────────────────────────────────────────────────────────────────────

/** Wraps a raw DB user ID into a branded UserId. Throws on empty input. */
export function toUserId(raw: string): UserId {
  if (!raw || typeof raw !== 'string') {
    throw new TypeError(`toUserId: expected non-empty string, got ${JSON.stringify(raw)}`);
  }
  return raw as UserId;
}

/** Wraps a raw DB session ID into a branded SessionId. Throws on empty input. */
export function toSessionId(raw: string): SessionId {
  if (!raw || typeof raw !== 'string') {
    throw new TypeError(`toSessionId: expected non-empty string, got ${JSON.stringify(raw)}`);
  }
  return raw as SessionId;
}
