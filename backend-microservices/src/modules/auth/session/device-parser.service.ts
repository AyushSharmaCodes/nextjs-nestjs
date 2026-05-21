/**
 * @file auth/session/device-parser.service.ts
 *
 * Typed wrapper around ua-parser-js.
 *
 * Contract:
 * - Input: raw User-Agent string (may be empty or spoofed)
 * - Output: ParsedDevice with branded DeviceFingerprint
 * - Raw ua-parser-js types NEVER escape this service
 * - Empty/bot User-Agents are handled gracefully (no throw)
 *
 * Fingerprint construction: SHA-256(userAgent + os + osVersion + browser)
 * Using Node's built-in crypto — no external dep.
 */

import { Injectable } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
import { createHash } from 'crypto';
import type {
  ParsedDevice,
  DeviceType,
  DeviceFingerprint,
} from '../../../shared/types/device.types';
import { toDeviceFingerprint } from '../../../shared/types/device.types';

@Injectable()
export class DeviceParserService {
  /**
   * Parse a User-Agent string into a strongly typed ParsedDevice.
   * Never throws — degrades to UNKNOWN fields if UA is empty/unrecognised.
   */
  parse(userAgent: string): ParsedDevice {
    const ua = userAgent.trim();
    const parser = new UAParser(ua);

    const device  = parser.getDevice();
    const os      = parser.getOS();
    const browser = parser.getBrowser();

    const deviceType  = this.mapDeviceType(device.type, ua);
    const osName      = os.name      ?? 'Unknown';
    const osVersion   = os.version   ?? '';
    const browserName = browser.name ?? 'Unknown';
    const browserVer  = browser.version ?? '';

    const fingerprint = this.buildFingerprint(ua, osName, osVersion, browserName);

    return {
      deviceType,
      os:             osName,
      osVersion,
      browser:        browserName,
      browserVersion: browserVer,
      fingerprint,
      rawUserAgent:   ua,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Maps ua-parser-js device type string to our DeviceType enum.
   * ua-parser-js types: 'console' | 'mobile' | 'tablet' | 'smarttv' | 'wearable' | 'embedded' | undefined
   * Bot detection via keyword scan when ua-parser returns undefined.
   */
  private mapDeviceType(uaType: string | undefined, rawUa: string): DeviceType {
    if (uaType === 'mobile')  return 'MOBILE';
    if (uaType === 'tablet')  return 'TABLET';

    // Heuristic bot detection — check common bot keywords in UA string
    if (this.isBotUserAgent(rawUa)) return 'BOT';

    // ua-parser returns undefined for desktop browsers
    if (uaType === undefined) return 'DESKTOP';

    // smarttv, wearable, console, embedded — treat as UNKNOWN
    return 'UNKNOWN';
  }

  /** Lightweight bot keyword check — not exhaustive, handles common crawlers. */
  private isBotUserAgent(ua: string): boolean {
    if (!ua) return true; // empty UA = likely bot/script
    const lower = ua.toLowerCase();
    const BOT_KEYWORDS = [
      'bot', 'crawler', 'spider', 'scraper', 'headless',
      'phantomjs', 'selenium', 'puppeteer', 'playwright',
      'googlebot', 'bingbot', 'slurp', 'duckduckbot',
    ];
    return BOT_KEYWORDS.some(kw => lower.includes(kw));
  }

  /**
   * SHA-256(userAgent + os + osVersion + browser) as hex.
   * The raw userAgent is included so two different UAs mapping to the
   * same os/browser still get different fingerprints.
   */
  private buildFingerprint(
    userAgent: string,
    os:        string,
    osVersion: string,
    browser:   string,
  ): DeviceFingerprint {
    const input  = `${userAgent}|${os}|${osVersion}|${browser}`;
    const digest = createHash('sha256').update(input, 'utf8').digest('hex');
    return toDeviceFingerprint(digest);
  }
}
