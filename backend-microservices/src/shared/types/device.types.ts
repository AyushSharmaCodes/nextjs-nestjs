/**
 * @file shared/types/device.types.ts
 *
 * All branded types, interfaces, and enums for the suspicious session
 * detection system.
 *
 * Architecture:
 *   DeviceSession is a WRITE-ONCE security audit record.
 *   It does NOT track session liveness — that is owned entirely by Better Auth.
 *   The JWT signature is the only thing verified on every request.
 *
 * Coupling rule: This file imports ONLY from 'shared/types/index.ts'.
 */

import type { UserId, SessionId } from './index';

// ─────────────────────────────────────────────────────────────────────────────
// Branded primitives
// ─────────────────────────────────────────────────────────────────────────────

/** SHA-256 hex string of (userAgent + os + osVersion + browser). */
export type DeviceFingerprint = string & { readonly _brand: 'DeviceFingerprint' };

/** IPv4 or IPv6 address — sourced from trusted proxy headers. */
export type IpAddress = string & { readonly _brand: 'IpAddress' };

/** ISO 3166-1 alpha-2 country code, or 'XX' for unknown. */
export type CountryCode = string & { readonly _brand: 'CountryCode' };

// ─────────────────────────────────────────────────────────────────────────────
// Enums (mirrored in Prisma schema — keep in sync)
// ─────────────────────────────────────────────────────────────────────────────

export type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'BOT' | 'UNKNOWN';

export type SessionRiskLevel = 'NORMAL' | 'SUSPICIOUS' | 'HIGH_RISK';

export const SUSPICION_REASONS = {
  NEW_IP:                 'NEW_IP',
  NEW_DEVICE_FINGERPRINT: 'NEW_DEVICE_FINGERPRINT',
  IMPOSSIBLE_TRAVEL:      'IMPOSSIBLE_TRAVEL',
  NEW_COUNTRY:            'NEW_COUNTRY',
  CONCURRENT_FOREIGN:     'CONCURRENT_FOREIGN',
} as const;

export type SuspicionReason =
  (typeof SUSPICION_REASONS)[keyof typeof SUSPICION_REASONS];

export type AuditResolution =
  | 'CONFIRMED_BY_USER'
  | 'REVOKED_BY_USER'
  | 'AUTO_REVOKED'
  | 'EXPIRED';

// ─────────────────────────────────────────────────────────────────────────────
// Composite interfaces
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Output of DeviceParserService.parse().
 * rawUserAgent is never persisted — only fingerprint + parsed fields stored.
 */
export interface ParsedDevice {
  readonly deviceType:     DeviceType;
  readonly os:             string;
  readonly osVersion:      string;
  readonly browser:        string;
  readonly browserVersion: string;
  readonly fingerprint:    DeviceFingerprint;
  readonly rawUserAgent:   string;  // used for fingerprint computation; not persisted
}

/** GeoIP resolution result. */
export interface GeoLocation {
  readonly ip:        IpAddress;
  readonly city:      string | null;
  readonly region:    string | null;
  readonly country:   CountryCode;
  readonly latitude:  number | null;
  readonly longitude: number | null;
  readonly isp:       string | null;
}

/** Output of RiskAssessmentService.assess() — pure, no side effects. */
export interface SessionRiskAssessment {
  readonly riskLevel:        SessionRiskLevel;
  readonly suspicionReasons: ReadonlyArray<SuspicionReason>;
  readonly isSuspicious:     boolean;
}

/**
 * Context passed to RiskAssessmentService — represents the sign-in being evaluated.
 */
export interface CurrentSessionContext {
  readonly ipAddress:   IpAddress;
  readonly device:      ParsedDevice;
  readonly geoLocation: GeoLocation;
  readonly createdAt:   string;   // ISO 8601 — used for travel + concurrent checks
}

/**
 * Input to SuspiciousSessionService.processSignIn().
 * Sourced from the Better Auth after-sign-in hook.
 *
 * betterAuthSessionId: BA session.id — used for HIGH_RISK session revocation.
 * sessionId:           BA session.token = JWT sessionId claim.
 *                      Used as correlation ID for audit records and trust/revoke actions.
 *
 * These are TWO DIFFERENT values from the same BA session record:
 *   session.id    → primary key → betterAuthSessionId
 *   session.token → JWT claim   → sessionId
 */
export interface SignInContext {
  readonly userId:              UserId;
  readonly betterAuthSessionId: string;   // BA session.id (primary key)
  readonly sessionId:           SessionId; // BA session.token (= JWT sessionId)
  readonly email:               string;
  readonly locale:              'en';
  readonly ipAddress:           IpAddress;
  readonly userAgent:           string;
  readonly requestId:           string;
}

/**
 * Domain entity returned from DeviceSessionRepository.
 * No raw Prisma types escape the repository layer.
 *
 * Note: No isActive field. Session liveness is owned by Better Auth.
 * Use BA session table to determine if a session is currently active.
 * DeviceSession is an immutable audit record of what happened AT sign-in time.
 */
export interface DeviceSessionEntity {
  readonly id:                  string;
  readonly userId:              UserId;
  readonly betterAuthSessionId: string;
  readonly sessionId:           SessionId;
  readonly ipAddress:           IpAddress;
  readonly geoLocation:         Omit<GeoLocation, 'ip'>;
  readonly device:              Omit<ParsedDevice, 'rawUserAgent'>;
  readonly isTrusted:           boolean;
  readonly trustGrantedAt:      string | null;
  readonly riskLevel:           SessionRiskLevel;
  readonly suspicionReasons:    ReadonlyArray<SuspicionReason>;
  readonly createdAt:           string;   // ISO 8601 — sign-in time
}

/**
 * DeviceSessionEntity enriched with liveness flag from Better Auth.
 * Used only in GET /auth/sessions response.
 */
export interface DeviceSessionWithActivity extends DeviceSessionEntity {
  readonly isCurrentlyActive: boolean;   // derived from BA session.expiresAt
}

/** DTO for DeviceSessionRepository.create(). */
export interface CreateDeviceSessionDto {
  readonly userId:              UserId;
  readonly betterAuthSessionId: string;
  readonly sessionId:           SessionId;
  readonly ipAddress:           IpAddress;
  readonly geoLocation:         Omit<GeoLocation, 'ip'>;
  readonly device:              Omit<ParsedDevice, 'rawUserAgent'>;
  readonly riskLevel:           SessionRiskLevel;
  readonly suspicionReasons:    ReadonlyArray<SuspicionReason>;
}

/** Options for findRecentByUserId. */
export interface FindRecentOptions {
  readonly limit: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe constructors for branded types
// ─────────────────────────────────────────────────────────────────────────────

export function toDeviceFingerprint(raw: string): DeviceFingerprint {
  if (!raw) throw new TypeError('toDeviceFingerprint: expected non-empty string');
  return raw as DeviceFingerprint;
}

export function toIpAddress(raw: string): IpAddress {
  if (!raw) throw new TypeError('toIpAddress: expected non-empty string');
  return raw as IpAddress;
}

export function toCountryCode(raw: string): CountryCode {
  if (!raw) throw new TypeError('toCountryCode: expected non-empty string');
  return raw.toUpperCase() as CountryCode;
}

/** Narrows a string[] from DB into ReadonlyArray<SuspicionReason>. */
export function toSuspicionReasons(raw: string[]): ReadonlyArray<SuspicionReason> {
  const valid = new Set(Object.values(SUSPICION_REASONS));
  return raw.filter((r): r is SuspicionReason => valid.has(r as SuspicionReason));
}
