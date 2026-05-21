/**
 * @file auth/session/constants/session-risk-rules.constant.ts
 *
 * Tunable thresholds for the suspicious session detection system.
 * SUSPICION_REASONS is re-exported here so session services only need one import.
 */

import type { CountryCode } from '../../../../shared/types/device.types';
export { SUSPICION_REASONS } from '../../../../shared/types/device.types';


export const SESSION_RISK_RULES = {
  /**
   * How many of the user's most recent sessions to compare IP/fingerprint against.
   * Higher = more lenient (more IPs considered "known").
   */
  TRUSTED_IP_HISTORY_WINDOW: 5,

  /**
   * km/h threshold above which travel is physically impossible.
   * Commercial aircraft cruise at ~900 km/h — anything above this is a flag.
   */
  MAX_TRAVEL_SPEED_KMH: 900,

  /**
   * Minimum distance in km between two sign-ins before travel is considered.
   * Prevents false positives from ISP routing changes within the same general area.
   */
  MIN_DISTANCE_KM: 100,

  /**
   * How many recent minutes of session history to check for concurrent foreign sessions.
   */
  CONCURRENT_WINDOW_MINUTES: 60,

  /**
   * If true, HIGH_RISK sessions are revoked before the HTTP response returns.
   */
  HIGH_RISK_AUTO_REVOKE: true,

  /**
   * Countries to always flag as suspicious, regardless of history.
   * Empty by default — populate with ISO 3166-1 alpha-2 codes.
   * Example: ['KP', 'IR'] as CountryCode[]
   */
  SOFT_FLAG_COUNTRIES: [] as CountryCode[],

  /**
   * Max number of DeviceSessions to fetch per user for risk assessment.
   * Caps DB read cost — older sessions have diminishing relevance.
   */
  MAX_HISTORY_FETCH: 20,
} as const;
