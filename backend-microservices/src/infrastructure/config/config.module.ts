import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnvironment } from '../../common/utils/env-validation';

/**
 * Centralized configuration module.
 * Single source of truth for all environment variables.
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
  exports: [NestConfigModule],
})
export class AppConfigModule {}
