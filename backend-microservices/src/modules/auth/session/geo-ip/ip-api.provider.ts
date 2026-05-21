/**
 * @file auth/session/geo-ip/ip-api.provider.ts
 *
 * GeoIP implementation using ip-api.com (free tier — no API key for HTTP).
 * Rate limit: 45 req/min on free tier. Use behind a cache in production.
 *
 * HTTPS requires a paid plan — switch to MaxMindProvider in production.
 *
 * Private/loopback IPs (127.x, 10.x, 192.168.x, ::1) are returned as
 * country='XX' (unknown) without hitting the API.
 *
 * Activate via: GEO_IP_PROVIDER=ipapi (SessionModule factory)
 */

import { Injectable, Logger } from '@nestjs/common';
import type { IGeoIpProvider } from './geo-ip-provider.interface';
import type {
  GeoLocation,
  IpAddress,
  CountryCode,
} from '../../../../shared/types/device.types';
import { toCountryCode, toIpAddress } from '../../../../shared/types/device.types';

/** Shape of the ip-api.com JSON response (fields= param selects these). */
interface IpApiResponse {
  readonly status:      'success' | 'fail';
  readonly message?:    string;  // present on fail
  readonly country:     string;
  readonly countryCode: string;
  readonly regionName:  string;
  readonly city:        string;
  readonly lat:         number;
  readonly lon:         number;
  readonly isp:         string;
  readonly query:       string;
}

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^::1$/,
  /^fc00:/,
  /^0\.0\.0\.0$/,
];

@Injectable()
export class IpApiProvider implements IGeoIpProvider {
  private readonly logger = new Logger(IpApiProvider.name);

  async resolve(ip: IpAddress): Promise<GeoLocation> {
    // Short-circuit private/loopback IPs — never leak to external API
    if (this.isPrivateIp(ip)) {
      return this.unknownLocation(ip);
    }

    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,lat,lon,isp,query`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(3000),  // 3s timeout — never block sign-in
      });

      if (!response.ok) {
        this.logger.warn(`IpApiProvider: HTTP ${response.status} for ${ip}`);
        return this.unknownLocation(ip);
      }

      const data = await response.json() as IpApiResponse;

      if (data.status === 'fail') {
        this.logger.warn(`IpApiProvider: API fail for ${ip}: ${data.message ?? 'unknown'}`);
        return this.unknownLocation(ip);
      }

      return {
        ip:        toIpAddress(data.query || ip),
        city:      data.city      || null,
        region:    data.regionName || null,
        country:   toCountryCode(data.countryCode || 'XX'),
        latitude:  typeof data.lat === 'number' ? data.lat : null,
        longitude: typeof data.lon === 'number' ? data.lon : null,
        isp:       data.isp || null,
      };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(`IpApiProvider: resolution failed for ${ip}: ${reason}`);
      throw new Error(`GeoIP resolution failed: ${reason}`);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private isPrivateIp(ip: string): boolean {
    return PRIVATE_IP_PATTERNS.some(pattern => pattern.test(ip));
  }

  private unknownLocation(ip: IpAddress): GeoLocation {
    return {
      ip,
      city:      null,
      region:    null,
      country:   'XX' as CountryCode,
      latitude:  null,
      longitude: null,
      isp:       null,
    };
  }
}
