/**
 * @file auth/session/risk-assessment.service.ts
 *
 * Pure, stateless risk assessment service.
 * NO database calls. NO external HTTP. NO event emission.
 * All inputs must be passed in; all outputs are pure data.
 *
 * Five detection rules:
 *   1. NEW_IP                — IP not seen in last N sign-ins
 *   2. NEW_DEVICE_FINGERPRINT — device fingerprint never seen before
 *   3. IMPOSSIBLE_TRAVEL     — physically impossible speed between sign-ins
 *   4. NEW_COUNTRY           — first time signing in from this country
 *   5. CONCURRENT_FOREIGN    — sign-in within 60 min from a different country
 *
 * Stateless JWT trade-off (Rule 5):
 *   We cannot check "currently active JWT sessions" without a per-request DB
 *   lookup, which breaks stateless auth. Instead, Rule 5 approximates concurrent
 *   foreign sessions by querying DeviceSession rows created in the last 60 minutes
 *   from a different country. If the attacker signed in recently, they left a
 *   DeviceSession record. This is an accepted approximation for stateless systems.
 *   See: SESSION_RISK_RULES.CONCURRENT_WINDOW_MINUTES
 *
 * Risk escalation:
 *   Any HIGH_RISK reason (IMPOSSIBLE_TRAVEL, NEW_COUNTRY, CONCURRENT_FOREIGN)
 *   upgrades the result to HIGH_RISK regardless of other reasons.
 *   Otherwise: ≥1 reason = SUSPICIOUS, 0 reasons = NORMAL.
 */

import { Injectable } from '@nestjs/common';
import {
  SUSPICION_REASONS,
  type SuspicionReason,
  type SessionRiskLevel,
  type SessionRiskAssessment,
  type CurrentSessionContext,
  type DeviceSessionEntity,
} from '../../../shared/types/device.types';
import { SESSION_RISK_RULES } from './constants/session-risk-rules.constant';

@Injectable()
export class RiskAssessmentService {

  /**
   * Assess risk level for a new sign-in against historical device sessions.
   *
   * @param current  - the device/geo context for the sign-in being evaluated
   * @param history  - DeviceSession records ordered by createdAt DESC (most recent first)
   * @returns        - pure risk assessment, no side effects
   */
  assess(
    current: CurrentSessionContext,
    history: ReadonlyArray<DeviceSessionEntity>,
  ): SessionRiskAssessment {
    const reasons: SuspicionReason[] = [];

    // ── Rule 1 — NEW_IP ─────────────────────────────────────────────────────
    //
    // Flag if the IP is not seen in the last TRUSTED_IP_HISTORY_WINDOW sign-ins.
    // Uses a sliding window to avoid flagging users who rotate IPs naturally.
    {
      const recentIps = new Set(
        history
          .slice(0, SESSION_RISK_RULES.TRUSTED_IP_HISTORY_WINDOW)
          .map(s => s.ipAddress as string),
      );
      if (history.length > 0 && !recentIps.has(current.ipAddress as string)) {
        reasons.push(SUSPICION_REASONS.NEW_IP);
      }
    }

    // ── Rule 2 — NEW_DEVICE_FINGERPRINT ─────────────────────────────────────
    //
    // SHA-256(UA + os + osVersion + browser) — deterministic, not guessable.
    // Flag if this fingerprint has never been seen for this user.
    {
      const knownFingerprints = new Set(
        history.map(s => s.device.fingerprint as string),
      );
      if (history.length > 0 && !knownFingerprints.has(current.device.fingerprint as string)) {
        reasons.push(SUSPICION_REASONS.NEW_DEVICE_FINGERPRINT);
      }
    }

    // ── Rule 3 — IMPOSSIBLE_TRAVEL ──────────────────────────────────────────
    //
    // Compare coordinates of this sign-in against the most recent historical
    // sign-in. If implied speed exceeds MAX_TRAVEL_SPEED_KMH, flag HIGH_RISK.
    //
    // Degrades gracefully: skipped if either session has null coordinates.
    {
      const lastSession = history[0];
      if (lastSession && this.isImpossibleTravel(lastSession, current)) {
        reasons.push(SUSPICION_REASONS.IMPOSSIBLE_TRAVEL);
      }
    }

    // ── Rule 4 — NEW_COUNTRY ────────────────────────────────────────────────
    //
    // Flag if this country code has never appeared in any historical session.
    // Skipped for 'XX' (GeoIP failed — unknown country). Flagging unknowns
    // would produce too many false positives (VPNs, satellite connections, etc.).
    {
      if ((current.geoLocation.country as string) !== 'XX') {
        const knownCountries = new Set(
          history.map(s => s.geoLocation.country as string),
        );
        if (history.length > 0 && !knownCountries.has(current.geoLocation.country as string)) {
          reasons.push(SUSPICION_REASONS.NEW_COUNTRY);
        }
      }
    }

    // ── Rule 5 — CONCURRENT_FOREIGN ─────────────────────────────────────────
    //
    // TRADE-OFF: Stateless JWT means we cannot enumerate "currently active sessions"
    // without a per-request DB lookup (which breaks the entire stateless model).
    //
    // Approximation: if any DeviceSession was CREATED within the last
    // CONCURRENT_WINDOW_MINUTES minutes from a DIFFERENT country, it implies a
    // concurrent foreign sign-in occurred recently. This only works if the attacker
    // signed in recently — older compromises are not caught by this rule.
    //
    // This is documented as an accepted trade-off for stateless JWT systems.
    // Option D (Redis blocklist) can add sub-minute revocation if required.
    {
      const currentCountry = current.geoLocation.country as string;
      if (currentCountry !== 'XX') {
        const hasRecentForeign = history.some(s => {
          const ageMinutes = this.minutesSince(s.createdAt);
          const sessionCountry = s.geoLocation.country as string;
          return (
            ageMinutes <= SESSION_RISK_RULES.CONCURRENT_WINDOW_MINUTES &&
            sessionCountry !== 'XX' &&
            sessionCountry !== currentCountry
          );
        });
        if (hasRecentForeign) {
          reasons.push(SUSPICION_REASONS.CONCURRENT_FOREIGN);
        }
      }
    }

    // ── Risk level escalation ────────────────────────────────────────────────

    const HIGH_RISK_TRIGGERS = new Set<SuspicionReason>([
      SUSPICION_REASONS.IMPOSSIBLE_TRAVEL,
      SUSPICION_REASONS.NEW_COUNTRY,
      SUSPICION_REASONS.CONCURRENT_FOREIGN,
    ]);

    const isHighRisk = reasons.some(r => HIGH_RISK_TRIGGERS.has(r));

    const riskLevel: SessionRiskLevel =
      reasons.length === 0 ? 'NORMAL'
      : isHighRisk          ? 'HIGH_RISK'
      :                       'SUSPICIOUS';

    return {
      riskLevel,
      suspicionReasons: reasons,
      isSuspicious: riskLevel !== 'NORMAL',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns true if travel between lastSession and current is physically
   * impossible given the elapsed time.
   *
   * Returns false (safe) if either session lacks coordinates — avoids
   * false positives for GeoIP-failed sessions (country='XX').
   */
  private isImpossibleTravel(
    lastSession: DeviceSessionEntity,
    current:     CurrentSessionContext,
  ): boolean {
    const { latitude: lat1, longitude: lon1 } = lastSession.geoLocation;
    const { latitude: lat2, longitude: lon2 } = current.geoLocation;

    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return false;  // Cannot compute without coordinates
    }

    const distanceKm = this.haversineKm(lat1, lon1, lat2, lon2);
    if (distanceKm < SESSION_RISK_RULES.MIN_DISTANCE_KM) {
      return false;  // Same-city movement — never impossible
    }

    const elapsedMs = Date.parse(current.createdAt) - Date.parse(lastSession.createdAt);
    if (elapsedMs <= 0) {
      // Clock skew or same-time sign-in — skip to avoid false positive
      return false;
    }

    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const impliedSpeedKmh = distanceKm / elapsedHours;

    return impliedSpeedKmh > SESSION_RISK_RULES.MAX_TRAVEL_SPEED_KMH;
  }

  /** Haversine formula — great-circle distance in km between two lat/lon pairs. */
  private haversineKm(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
  ): number {
    const R   = 6371;   // Earth radius in km
    const φ1  = (lat1 * Math.PI) / 180;
    const φ2  = (lat2 * Math.PI) / 180;
    const Δφ  = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ  = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /** Returns how many minutes ago the given ISO 8601 timestamp was. */
  private minutesSince(isoTimestamp: string): number {
    return (Date.now() - Date.parse(isoTimestamp)) / (1000 * 60);
  }
}
