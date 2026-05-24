/**
 * @file auth/session/geo-ip/maxmind.provider.ts
 *
 * GeoIP implementation using the MaxMind GeoLite2-City database (offline).
 *
 * Advantages over ip-api.com:
 * - No rate limit (local DB file)
 * - No network call per request (sub-millisecond lookup)
 * - HTTPS not required (no outbound call at all)
 * - GDPR-friendly (data stays in your infra)
 *
 * Setup:
 *   1. Download GeoLite2-City.mmdb from https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
 *   2. Set MAXMIND_DB_PATH=/path/to/GeoLite2-City.mmdb in .env
 *   3. Set GEO_IP_PROVIDER=maxmind in .env
 *
 * The @maxmind/geoip2-node package is optional — install when using this provider:
 *   npm install @maxmind/geoip2-node
 *
 * Trade-off: DB file must be updated weekly (free licence). Use cron or
 * MaxMind's geoipupdate tool to keep it fresh.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import type { CountryCode, GeoLocation, IpAddress } from '../../../../shared/types/device.types';
import { toCountryCode, toIpAddress } from '../../../../shared/types/device.types';
import type { IGeoIpProvider } from './geo-ip-provider.interface';

// Dynamic import to make @maxmind/geoip2-node optional at compile time.
// If the package is not installed, MaxMindProvider will throw on first use.
// This avoids making it a hard dependency for users who use IpApiProvider.
type WebServiceClient = {
  city: (ip: string) => Promise<MaxMindCityResponse>;
  close: () => void;
};

interface MaxMindCityResponse {
  city?: { names?: { en?: string } };
  subdivisions?: Array<{ names?: { en?: string } }>;
  country?: { isoCode?: string; names?: { en?: string } };
  location?: { latitude?: number; longitude?: number };
  traits?: { isp?: string; ipAddress?: string };
}

@Injectable()
export class MaxMindProvider implements IGeoIpProvider {
  private readonly logger = new Logger(MaxMindProvider.name);
  private reader: WebServiceClient | null = null;

  constructor(private readonly config: ConfigService) {}

  async resolve(ip: IpAddress): Promise<GeoLocation> {
    const reader = await this.getReader();

    try {
      const response = await reader.city(ip);

      const country = response.country?.isoCode;
      const city = response.city?.names?.en ?? null;
      const region = response.subdivisions?.[0]?.names?.en ?? null;
      const lat = response.location?.latitude ?? null;
      const lon = response.location?.longitude ?? null;
      const isp = response.traits?.isp ?? null;

      return {
        ip: toIpAddress(response.traits?.ipAddress ?? ip),
        city,
        region,
        country: country ? toCountryCode(country) : ('XX' as CountryCode),
        latitude: typeof lat === 'number' ? lat : null,
        longitude: typeof lon === 'number' ? lon : null,
        isp,
      };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(`MaxMindProvider: lookup failed for ${ip}: ${reason}`);
      throw new Error(`GeoIP resolution failed: ${reason}`);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async getReader(): Promise<WebServiceClient> {
    if (this.reader) return this.reader;

    const dbPath = this.config.get<string>('MAXMIND_DB_PATH');
    if (!dbPath) {
      throw new Error(
        'MaxMindProvider: MAXMIND_DB_PATH env var is not set. ' + 'Download GeoLite2-City.mmdb and set the path.',
      );
    }

    try {
      // Dynamic import — @maxmind/geoip2-node is an optional runtime dependency.
      // The 'as string' cast bypasses the compile-time module resolution check.
      // Install with: npm install @maxmind/geoip2-node
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Reader } = (await import('@maxmind/geoip2-node' as string)) as {
        Reader: { open: (p: string) => Promise<WebServiceClient> };
      };
      this.reader = await Reader.open(path.resolve(dbPath));
      return this.reader;
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(
        `MaxMindProvider: failed to open DB at ${dbPath}: ${reason}. ` + 'Run: npm install @maxmind/geoip2-node',
      );
    }
  }
}
