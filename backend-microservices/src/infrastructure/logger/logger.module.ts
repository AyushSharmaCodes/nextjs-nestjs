import { Module, Global } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { IncomingMessage } from 'http';

import { AppConfigService } from '../config/app-config.service';

/**
 * Centralized Pino-based structured logging.
 * Replaces per-service LoggerModule imports.
 */
@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (cfg: AppConfigService) => ({
        pinoHttp: {
          level: !cfg.isProduction ? 'debug' : 'info',
          genReqId: (req: IncomingMessage) => {
            return (req.headers['x-correlation-id'] as string) || uuidv4();
          },
          transport: !cfg.isProduction
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
          customProps: () => ({
            context: 'HTTP',
            service: 'merigaumata-api',
          }),
          autoLogging: true,
        },
      }),
      inject: [AppConfigService],
    }),
  ],
})
export class AppLoggerModule {}
