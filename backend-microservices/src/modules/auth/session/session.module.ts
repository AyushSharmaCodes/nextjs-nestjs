/**
 * @file auth/session/session.module.ts
 *
 * Wires all session detection services into a self-contained NestJS module.
 *
 * Provider selection:
 * - GEO_IP_PROVIDER: controlled by GEO_IP_PROVIDER env var
 *     'maxmind' → MaxMindProvider (requires MAXMIND_DB_PATH + npm install @maxmind/geoip2-node)
 *     'ipapi'   → IpApiProvider   (free, HTTP, dev/staging default)
 *     default   → IpApiProvider
 *
 * Exported: SuspiciousSessionService + DeviceSessionRepository
 * (AuthModule imports SessionModule to get these)
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../../infrastructure/database/prisma/prisma.module';

// Services
import { DeviceParserService }       from './device-parser.service';
import { GeoIpService }              from './geo-ip/geo-ip.service';
import { RiskAssessmentService }     from './risk-assessment.service';
import { DeviceSessionRepository }   from './device-session.repository';
import { SuspiciousSessionService }  from './suspicious-session.service';

// GeoIP providers
import { GEO_IP_PROVIDER_TOKEN, type IGeoIpProvider } from './geo-ip/geo-ip-provider.interface';
import { IpApiProvider }    from './geo-ip/ip-api.provider';
import { MaxMindProvider }  from './geo-ip/maxmind.provider';

import { AuthEventEmitter }          from '../events/auth-event.emitter';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
  ],
  providers: [
    // ── GeoIP provider (env-driven) ─────────────────────────────────────────
    {
      provide:    GEO_IP_PROVIDER_TOKEN,
      useFactory: (config: ConfigService): IGeoIpProvider => {
        const provider = config.get<string>('GEO_IP_PROVIDER', 'ipapi').toLowerCase();
        if (provider === 'maxmind') {
          return new MaxMindProvider(config);
        }
        return new IpApiProvider();
      },
      inject: [ConfigService],
    },

    // ── Core session services ────────────────────────────────────────────────
    DeviceParserService,
    GeoIpService,
    RiskAssessmentService,
    DeviceSessionRepository,
    SuspiciousSessionService,
    AuthEventEmitter,
  ],
  exports: [
    SuspiciousSessionService,
    DeviceSessionRepository,
  ],
})
export class SessionModule {}
