/**
 * @file auth/session/geo-ip/geo-ip.service.ts
 *
 * Provider-agnostic GeoIP orchestrator.
 *
 * - Delegates to the injected IGeoIpProvider (IpApiProvider | MaxMindProvider)
 * - Catches all provider errors — NEVER lets them propagate to sign-in flow
 * - On failure: returns country='XX', nulls for coords (graceful degradation)
 * - Caches resolved IPs in memory (LRU-lite via Map + cap) to avoid
 *   redundant API calls when the same IP signs in multiple times quickly
 *
 * The cache TTL is 10 minutes — long enough to avoid burst duplicate calls,
 * short enough not to serve stale data for VPN/proxy users who change locations.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { GEO_IP_PROVIDER_TOKEN, type IGeoIpProvider } from './geo-ip-provider.interface';
import type { GeoLocation, IpAddress, CountryCode } from '../../../../shared/types/device.types';

const CACHE_MAX_SIZE = 500;
const CACHE_TTL_MS   = 10 * 60 * 1000;  // 10 minutes

interface CacheEntry {
  readonly location:  GeoLocation;
  readonly expiresAt: number;
}

@Injectable()
export class GeoIpService {
  private readonly logger = new Logger(GeoIpService.name);
  private readonly cache  = new Map<string, CacheEntry>();

  constructor(
    @Inject(GEO_IP_PROVIDER_TOKEN)
    private readonly provider: IGeoIpProvider,
  ) {}

  /**
   * Resolve an IP address to a GeoLocation.
   * Never throws — returns unknown sentinel on failure.
   */
  async resolve(ip: IpAddress): Promise<GeoLocation> {
    // Check cache first
    const cached = this.cache.get(ip);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.location;
    }

    try {
      const location = await this.provider.resolve(ip);
      this.setCache(ip, location);
      return location;
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        { ip, reason },
        `GeoIpService: provider resolution failed — degrading to unknown location`,
      );
      return this.unknownLocation(ip);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private setCache(ip: string, location: GeoLocation): void {
    // Evict oldest entry if at capacity (simple FIFO eviction)
    if (this.cache.size >= CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(ip, { location, expiresAt: Date.now() + CACHE_TTL_MS });
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
