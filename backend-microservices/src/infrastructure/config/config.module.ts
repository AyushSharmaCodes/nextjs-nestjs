import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnvironment } from '../../common/utils/env-validation';
import { AppConfigService } from './app-config.service';

/**
 * Centralized configuration module.
 *
 * - Validates all env vars at startup via Zod (crashes on failure).
 * - Exports AppConfigService as the single typed config accessor.
 * - Global: no need to import this module in every domain module.
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnvironment,
      expandVariables: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
