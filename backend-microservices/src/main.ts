import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { I18nService } from 'nestjs-i18n';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { FriendlyErrorFilter } from './common/filters/friendly-error.filter';
import { AppConfigService } from './infrastructure/config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // NestJS Pino handles logging
      trustProxy: true, // Enable trust proxy for load balancer compatibility
    }),
    {
      bufferLogs: true,
    },
  );

  const logger = app.get(PinoLogger);
  const cfg = app.get(AppConfigService);

  // ═══════════════════════════════════════
  // 1. Structured Logging (Pino)
  // ═══════════════════════════════════════
  app.useLogger(logger);

  // ═══════════════════════════════════════
  // 2. Graceful Shutdown
  // ═══════════════════════════════════════
  app.enableShutdownHooks();

  // ═══════════════════════════════════════
  // 3. Security Middlewares
  // ═══════════════════════════════════════
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });

  // ═══════════════════════════════════════
  // 4. Compression, Cookie Parsing & Multipart
  // ═══════════════════════════════════════
  await app.register(fastifyCompress);
  await app.register(fastifyCookie, { secret: cfg.betterAuthSecret });
  await app.register(fastifyMultipart);

  // ═══════════════════════════════════════
  // 5. CORS
  // ═══════════════════════════════════════
  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, allow: boolean) => void) => {
      // Allow requests with no origin (like curl or direct server-to-server calls)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      const allowedOrigins = cfg.allowedOrigins;

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        cfg.isDevelopment
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-better-auth-handshake',
      'better-auth-agent',
      'cookie',
    ],
    exposedHeaders: ['set-cookie'],
  });

  // ═══════════════════════════════════════
  // 6. Global Validation Pipe (Zod)
  // ═══════════════════════════════════════
  // ZodValidationPipe replaces class-validator's ValidationPipe since all DTOs
  // use createZodDto() from nestjs-zod
  app.useGlobalPipes(new ZodValidationPipe());

  // ═══════════════════════════════════════
  // 7. Global Exception Filter
  // ═══════════════════════════════════════
  // I18nService is retrieved from the app container so the filter can
  // resolve translated error messages via Accept-Language header.
  const i18n = app.get<I18nService>(I18nService);
  app.useGlobalFilters(new FriendlyErrorFilter(logger, i18n));

  // ═══════════════════════════════════════
  // 8. Start HTTP Server
  // ═══════════════════════════════════════
  const port = cfg.port;
  await app.listen(port, '0.0.0.0');

  const appLogger = new Logger('Bootstrap');
  appLogger.log(`🚀 MeriGauMata API running on port ${port}`);
  appLogger.log(`📋 Health check: http://localhost:${port}/health`);
  appLogger.log(`🌍 Environment: ${cfg.nodeEnv}`);

  // ═══════════════════════════════════════
  // 9. Graceful Shutdown Handlers
  // ═══════════════════════════════════════
  const shutdown = async (signal: string) => {
    appLogger.log(`Received ${signal}. Starting graceful shutdown...`);
    try {
      await app.close();
      appLogger.log('Graceful shutdown complete.');
      process.exit(0);
    } catch (err) {
      appLogger.error('Failed to shut down gracefully:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap();
