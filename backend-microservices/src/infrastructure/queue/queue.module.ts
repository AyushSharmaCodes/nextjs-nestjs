import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';

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
      useFactory: (config: ConfigService) => {
        const rawRedis = config.get<string>('REDIS_URL') || config.get<string>('REDIS_HOST') || 'localhost';
        
        const connectionOpts: RedisOptions = {
          host: 'localhost',
          port: 6379,
        };

        if (rawRedis.startsWith('redis://') || rawRedis.startsWith('rediss://')) {
          const parsedUrl = new URL(rawRedis);
          connectionOpts.host = parsedUrl.hostname;
          connectionOpts.port = parseInt(parsedUrl.port, 10) || (parsedUrl.protocol === 'rediss:' ? 6380 : 6379);
          
          if (parsedUrl.username) connectionOpts.username = parsedUrl.username;
          if (parsedUrl.password) connectionOpts.password = parsedUrl.password;
          if (parsedUrl.protocol === 'rediss:') {
            connectionOpts.tls = { rejectUnauthorized: false };
          }
        } else {
          connectionOpts.host = rawRedis;
          connectionOpts.port = config.get<number>('REDIS_PORT', 6379);
          
          const password = config.get<string>('REDIS_PASSWORD');
          if (password) connectionOpts.password = password;
        }

        return {
          connection: {
            ...connectionOpts,
            // Don't crash on startup if Redis is unavailable
            enableOfflineQueue: false,
            lazyConnect: true,
            maxRetriesPerRequest: null, // REQUIRED by BullMQ
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
          skipConfigCheck: true,
        };
      },
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
