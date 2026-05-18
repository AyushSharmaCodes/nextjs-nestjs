import { Module, Global } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { IncomingMessage } from 'http';

/**
 * Centralized Pino-based structured logging.
 * Replaces per-service LoggerModule imports.
 */
@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        genReqId: (req: IncomingMessage) => {
          return (req.headers['x-correlation-id'] as string) || uuidv4();
        },
        transport:
          process.env.NODE_ENV !== 'production'
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
  ],
})
export class AppLoggerModule {}
