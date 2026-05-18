import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { FriendlyErrorFilter } from './common/filters/friendly-error.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(PinoLogger);

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
  app.use(helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // ═══════════════════════════════════════
  // 4. Compression & Cookie Parsing
  // ═══════════════════════════════════════
  app.use(compression());
  app.use(cookieParser());

  // ═══════════════════════════════════════
  // 5. CORS
  // ═══════════════════════════════════════
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000']);
  app.enableCors({
    origin: origins,
    credentials: true,
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
  app.useGlobalFilters(new FriendlyErrorFilter(logger));

  // ═══════════════════════════════════════
  // 8. Start HTTP Server
  // ═══════════════════════════════════════
  const port = process.env.PORT || 3000;
  await app.listen(port);

  const appLogger = new Logger('Bootstrap');
  appLogger.log(`🚀 MeriGauMata API running on port ${port}`);
  appLogger.log(`📋 Health check: http://localhost:${port}/health`);
  appLogger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

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
