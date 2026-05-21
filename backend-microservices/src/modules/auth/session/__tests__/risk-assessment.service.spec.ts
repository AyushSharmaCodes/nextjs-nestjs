/**
 * @file auth/session/__tests__/risk-assessment.service.spec.ts
 *
 * Unit test outline for RiskAssessmentService — all 5 detection rules.
 *
 * Each test group is fully self-contained with typed mock data.
 * No DB, no HTTP, no EventEmitter dependencies.
 *
 * Run: npx jest risk-assessment.service --verbose
 */

import { RiskAssessmentService } from '../risk-assessment.service';
import type {
  CurrentSessionContext,
  DeviceSessionEntity,
} from '../../../../shared/types/device.types';
import { SUSPICION_REASONS } from '../../../../shared/types/device.types';

// ─────────────────────────────────────────────────────────────────────────────
// Test fixture helpers
// ─────────────────────────────────────────────────────────────────────────────

const makeSession = (
  overrides: Partial<DeviceSessionEntity> = {},
): DeviceSessionEntity => ({
  id:              '00000000-0000-0000-0000-000000000001',
  userId:          'user-1' as DeviceSessionEntity['userId'],
  betterAuthSessionId: 'ba-sess-1',
  sessionId:       'sess-1' as DeviceSessionEntity['sessionId'],
  ipAddress:       '1.2.3.4' as DeviceSessionEntity['ipAddress'],
  geoLocation: {
    city:      'Mumbai',
    region:    'Maharashtra',
    country:   'IN' as DeviceSessionEntity['geoLocation']['country'],
    latitude:  19.076,
    longitude: 72.877,
    isp:       'Jio',
  },
  device: {
    deviceType:     'DESKTOP',
    os:             'Windows',
    osVersion:      '11',
    browser:        'Chrome',
    browserVersion: '124',
    fingerprint:    'fp-known' as DeviceSessionEntity['device']['fingerprint'],
  },
  isTrusted:        false,
  trustGrantedAt:   null,
  riskLevel:        'NORMAL',
  suspicionReasons: [],
  createdAt:        new Date('2024-01-01T10:00:00Z').toISOString(),
  ...overrides,
});

const makeContext = (
  overrides: Partial<CurrentSessionContext> = {},
): CurrentSessionContext => ({
  ipAddress:  '1.2.3.4' as CurrentSessionContext['ipAddress'],
  device: {
    deviceType:     'DESKTOP',
    os:             'Windows',
    osVersion:      '11',
    browser:        'Chrome',
    browserVersion: '124',
    fingerprint:    'fp-known' as CurrentSessionContext['device']['fingerprint'],
    rawUserAgent:   'Mozilla/5.0...',
  },
  geoLocation: {
    ip:        '1.2.3.4' as CurrentSessionContext['geoLocation']['ip'],
    city:      'Mumbai',
    region:    'Maharashtra',
    country:   'IN' as CurrentSessionContext['geoLocation']['country'],
    latitude:  19.076,
    longitude: 72.877,
    isp:       'Jio',
  },
  createdAt: new Date('2024-01-01T11:00:00Z').toISOString(),
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('RiskAssessmentService', () => {
  let service: RiskAssessmentService;

  beforeEach(() => {
    service = new RiskAssessmentService();
  });

  // ── Base case ────────────────────────────────────────────────────────────

  describe('NORMAL — no history', () => {
    it('should return NORMAL with no reasons when there is no history', () => {
      const result = service.assess(makeContext(), []);

      expect(result.riskLevel).toBe('NORMAL');
      expect(result.suspicionReasons).toHaveLength(0);
      expect(result.isSuspicious).toBe(false);
    });
  });

  describe('NORMAL — known IP and device', () => {
    it('should return NORMAL when IP and fingerprint are in history', () => {
      const history = [makeSession()];  // same IP + fingerprint as context defaults

      const result = service.assess(makeContext(), history);

      expect(result.riskLevel).toBe('NORMAL');
    });
  });

  // ── Rule 1: NEW_IP ───────────────────────────────────────────────────────

  describe('Rule 1 — NEW_IP', () => {
    it('should flag SUSPICIOUS when IP is not in last 5 sessions', () => {
      const history = [
        makeSession({ ipAddress: '10.0.0.1' as any }),
        makeSession({ ipAddress: '10.0.0.2' as any }),
      ];

      const ctx = makeContext({ ipAddress: '99.99.99.99' as any });
      const result = service.assess(ctx, history);

      expect(result.suspicionReasons).toContain(SUSPICION_REASONS.NEW_IP);
      expect(result.riskLevel).toBe('SUSPICIOUS');
    });

    it('should NOT flag NEW_IP when IP appears in the last 5 sessions', () => {
      const history = [
        makeSession({ ipAddress: '1.2.3.4' as any }),
        makeSession({ ipAddress: '10.0.0.1' as any }),
      ];

      const ctx = makeContext({ ipAddress: '1.2.3.4' as any });
      const result = service.assess(ctx, history);

      expect(result.suspicionReasons).not.toContain(SUSPICION_REASONS.NEW_IP);
    });
  });

  // ── Rule 2: NEW_DEVICE_FINGERPRINT ──────────────────────────────────────

  describe('Rule 2 — NEW_DEVICE_FINGERPRINT', () => {
    it('should flag SUSPICIOUS when fingerprint has never been seen', () => {
      const history = [makeSession({ device: { ...makeSession().device, fingerprint: 'fp-old' as any } })];

      const ctx = makeContext({
        device: { ...makeContext().device, fingerprint: 'fp-brand-new' as any },
      });

      const result = service.assess(ctx, history);

      expect(result.suspicionReasons).toContain(SUSPICION_REASONS.NEW_DEVICE_FINGERPRINT);
    });

    it('should NOT flag when fingerprint appears in history', () => {
      const history = [makeSession()];  // fingerprint: 'fp-known'
      const ctx = makeContext();        // fingerprint: 'fp-known'

      const result = service.assess(ctx, history);

      expect(result.suspicionReasons).not.toContain(SUSPICION_REASONS.NEW_DEVICE_FINGERPRINT);
    });
  });

  // ── Rule 3: IMPOSSIBLE_TRAVEL ────────────────────────────────────────────

  describe('Rule 3 — IMPOSSIBLE_TRAVEL', () => {
    it('should flag HIGH_RISK when travel speed exceeds 900 km/h', () => {
      // Mumbai → New York (≈12,500 km) in 30 minutes = ~25,000 km/h
      const lastSession = makeSession({
        geoLocation: {
          ...makeSession().geoLocation,
          latitude:  19.076,   // Mumbai
          longitude: 72.877,
        },
        createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
      });

      const ctx = makeContext({
        geoLocation: {
          ...makeContext().geoLocation,
          country:   'US' as any,
          latitude:  40.7128,   // New York
          longitude: -74.0060,
        },
        createdAt: new Date('2024-01-01T10:30:00Z').toISOString(),  // 30 min later
      });

      const result = service.assess(ctx, [lastSession]);

      expect(result.suspicionReasons).toContain(SUSPICION_REASONS.IMPOSSIBLE_TRAVEL);
      expect(result.riskLevel).toBe('HIGH_RISK');
    });

    it('should NOT flag when distance is reasonable for elapsed time', () => {
      // Same city — 0 km/h
      const lastSession = makeSession({
        geoLocation: { ...makeSession().geoLocation, latitude: 19.076, longitude: 72.877 },
        createdAt:  new Date('2024-01-01T10:00:00Z').toISOString(),
      });

      const ctx = makeContext({
        geoLocation: { ...makeContext().geoLocation, latitude: 19.08, longitude: 72.88 },
        createdAt:  new Date('2024-01-01T12:00:00Z').toISOString(),
      });

      const result = service.assess(ctx, [lastSession]);

      expect(result.suspicionReasons).not.toContain(SUSPICION_REASONS.IMPOSSIBLE_TRAVEL);
    });

    it('should skip travel check when either session has null coordinates', () => {
      const lastSession = makeSession({
        geoLocation: { ...makeSession().geoLocation, latitude: null, longitude: null },
      });

      const ctx = makeContext({
        geoLocation: { ...makeContext().geoLocation, latitude: 19.076, longitude: 72.877 },
      });

      const result = service.assess(ctx, [lastSession]);

      expect(result.suspicionReasons).not.toContain(SUSPICION_REASONS.IMPOSSIBLE_TRAVEL);
    });
  });

  // ── Rule 4: NEW_COUNTRY ──────────────────────────────────────────────────

  describe('Rule 4 — NEW_COUNTRY', () => {
    it('should flag HIGH_RISK when country has never been seen before', () => {
      const history = [makeSession({ geoLocation: { ...makeSession().geoLocation, country: 'IN' as any } })];

      const ctx = makeContext({
        geoLocation: { ...makeContext().geoLocation, country: 'US' as any },
      });

      const result = service.assess(ctx, history);

      expect(result.suspicionReasons).toContain(SUSPICION_REASONS.NEW_COUNTRY);
      expect(result.riskLevel).toBe('HIGH_RISK');
    });

    it('should NOT flag when country XX (GeoIP failed) is encountered', () => {
      const history = [makeSession()];

      const ctx = makeContext({
        geoLocation: { ...makeContext().geoLocation, country: 'XX' as any },
      });

      const result = service.assess(ctx, history);

      expect(result.suspicionReasons).not.toContain(SUSPICION_REASONS.NEW_COUNTRY);
    });
  });

  // ── Rule 5: CONCURRENT_FOREIGN ───────────────────────────────────────────

  describe('Rule 5 — CONCURRENT_FOREIGN', () => {
    it('should flag HIGH_RISK when an active session exists from a different country', () => {
      const foreignActiveSession = makeSession({
        createdAt:   new Date().toISOString(),
        geoLocation: { ...makeSession().geoLocation, country: 'US' as any },
      });

      const ctx = makeContext({
        geoLocation: { ...makeContext().geoLocation, country: 'IN' as any },
      });

      const result = service.assess(ctx, [foreignActiveSession]);

      expect(result.suspicionReasons).toContain(SUSPICION_REASONS.CONCURRENT_FOREIGN);
      expect(result.riskLevel).toBe('HIGH_RISK');
    });

    it('should NOT flag when the active session is from the same country', () => {
      const sameCountrySession = makeSession({
        createdAt:   new Date().toISOString(),
        geoLocation: { ...makeSession().geoLocation, country: 'IN' as any },
      });

      const ctx = makeContext({
        geoLocation: { ...makeContext().geoLocation, country: 'IN' as any },
      });

      const result = service.assess(ctx, [sameCountrySession]);

      expect(result.suspicionReasons).not.toContain(SUSPICION_REASONS.CONCURRENT_FOREIGN);
    });

    it('should NOT flag concurrent XX sessions (GeoIP failed)', () => {
      const xxSession = makeSession({
        createdAt:   new Date().toISOString(),
        geoLocation: { ...makeSession().geoLocation, country: 'XX' as any },
      });

      const ctx = makeContext({
        geoLocation: { ...makeContext().geoLocation, country: 'IN' as any },
      });

      const result = service.assess(ctx, [xxSession]);

      expect(result.suspicionReasons).not.toContain(SUSPICION_REASONS.CONCURRENT_FOREIGN);
    });
  });

  // ── Risk level escalation ─────────────────────────────────────────────────

  describe('Risk level escalation', () => {
    it('returns HIGH_RISK (not SUSPICIOUS) when both soft and hard rules trigger', () => {
      const history: DeviceSessionEntity[] = [];  // new user — NEW_IP + NEW_DEVICE would be soft
      // But NEW_COUNTRY makes it HIGH_RISK

      const history2 = [
        makeSession({ ipAddress: '10.0.0.1' as any, geoLocation: { ...makeSession().geoLocation, country: 'IN' as any } }),
      ];

      const ctx = makeContext({
        ipAddress:  '99.99.99.99' as any,   // NEW_IP (soft)
        geoLocation: { ...makeContext().geoLocation, country: 'US' as any },  // NEW_COUNTRY (hard)
      });

      const result = service.assess(ctx, history2);

      expect(result.riskLevel).toBe('HIGH_RISK');
    });
  });
});
