/**
 * @file auth/session/geo-ip/geo-ip-provider.interface.ts
 *
 * Abstraction for GeoIP resolution providers.
 * Swap implementation via GEO_IP_PROVIDER_TOKEN in SessionModule.
 */

import type { GeoLocation, IpAddress } from '../../../../shared/types/device.types';

export const GEO_IP_PROVIDER_TOKEN = Symbol('GEO_IP_PROVIDER');

export interface IGeoIpProvider {
  /**
   * Resolve an IP address to geographic + ISP metadata.
   * Implementations MUST throw on unrecoverable errors.
   * GeoIpService.resolve() handles degradation.
   */
  resolve(ip: IpAddress): Promise<GeoLocation>;
}
