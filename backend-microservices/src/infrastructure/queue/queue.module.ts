import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Centralized BullMQ queue module.
 *
 * Queues are ONLY for background processing:
 * - emails, SMS, notifications
 * - scheduled/cron jobs
 * - analytics aggregation
 * - heavy file processing
 *
 * NOT for normal module-to-module communication (use EventEmitter for that).
 *
 * The `enableOfflineQueue: false` + `lazyConnect: true` + `maxRetriesPerRequest: 0`
 * combination makes ioredis non-fatal on startup when Redis is not available.
 * The queues will reconnect automatically when Redis comes online.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          ...(config.get('REDIS_URL')
            ? { url: config.get('REDIS_URL') }
            : {}),
          // Don't crash on startup if Redis is unavailable
          enableOfflineQueue: false,
          lazyConnect: true,
          maxRetriesPerRequest: 0,
          retryStrategy: (times: number) => {
            if (times > 3) return null; // stop retrying, don't crash
            return Math.min(times * 200, 3000);
          },
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'notification' },
      { name: 'analytics' },
      { name: 'storage' },
      { name: 'cron' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
