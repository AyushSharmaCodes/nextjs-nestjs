/**
 * @file auth/session/device-session.mapper.ts
 *
 * Converts raw Prisma DeviceSession records into DeviceSessionEntity.
 *
 * Rules:
 * - No raw Prisma types escape this file
 * - All branded types constructed via safe constructors
 * - No isActive/signedOutAt — liveness is owned by Better Auth
 */

import type { DeviceSession as PrismaDeviceSession } from '@prisma/client';
import type { DeviceSessionEntity } from '../../../shared/types/device.types';
import {
  toDeviceFingerprint,
  toIpAddress,
  toCountryCode,
  toSuspicionReasons,
} from '../../../shared/types/device.types';
import type { DeviceType, SessionRiskLevel } from '../../../shared/types/device.types';
import { toUserId, toSessionId } from '../../../shared/types/index';

export class DeviceSessionMapper {
  static toDomain(raw: PrismaDeviceSession): DeviceSessionEntity {
    return {
      id:                  raw.id,
      userId:              toUserId(raw.userId),
      betterAuthSessionId: raw.betterAuthSessionId,
      sessionId:           toSessionId(raw.sessionId),
      ipAddress:           toIpAddress(raw.ipAddress),

      geoLocation: {
        city:      raw.city ?? null,
        region:    raw.region ?? null,
        country:   toCountryCode(raw.country),
        latitude:  raw.latitude ?? null,
        longitude: raw.longitude ?? null,
        isp:       raw.isp ?? null,
      },

      device: {
        deviceType:     raw.deviceType as DeviceType,
        os:             raw.os,
        osVersion:      raw.osVersion,
        browser:        raw.browser,
        browserVersion: raw.browserVersion,
        fingerprint:    toDeviceFingerprint(raw.fingerprint),
      },

      isTrusted:        raw.isTrusted,
      trustGrantedAt:   raw.trustGrantedAt?.toISOString() ?? null,
      riskLevel:        raw.riskLevel as SessionRiskLevel,
      suspicionReasons: toSuspicionReasons(raw.suspicionReasons),
      createdAt:        raw.createdAt.toISOString(),
    };
  }

  static toDomainArray(raws: PrismaDeviceSession[]): ReadonlyArray<DeviceSessionEntity> {
    return raws.map(DeviceSessionMapper.toDomain);
  }
}
