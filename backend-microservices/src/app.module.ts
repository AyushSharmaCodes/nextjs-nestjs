import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Infrastructure modules
import { AppConfigModule } from './infrastructure/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AppLoggerModule } from './infrastructure/logger/logger.module';
import { HealthModule } from './infrastructure/health/health.module';
import { AppI18nModule } from './infrastructure/i18n/i18n.module';
import { AppEventEmitterModule } from './infrastructure/events/event-emitter.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { MailModule } from './infrastructure/mail/mail.module';

// Domain modules
import { AuthDomainModule } from './modules/auth/auth-domain.module';
import { UserDomainModule } from './modules/user/user-domain.module';
import { ProductDomainModule } from './modules/product/product-domain.module';
import { CartDomainModule } from './modules/cart/cart-domain.module';
import { OrderDomainModule } from './modules/order/order-domain.module';
import { PaymentDomainModule } from './modules/payment/payment-domain.module';
import { CommunicationDomainModule } from './modules/communication/communication-domain.module';
import { ContentDomainModule } from './modules/content/content-domain.module';
import { StorageDomainModule } from './modules/storage/storage-domain.module';
import { EventDomainModule } from './modules/event/event-domain.module';
import { AnalyticsDomainModule } from './modules/analytics/analytics-domain.module';
import { CronDomainModule } from './modules/cron/cron-domain.module';

// Shared providers
import { TracingInterceptor } from './common/interceptors/tracing.interceptor';
import { CsrfGuard } from './common/guards/csrf.guard';

@Module({
  imports: [
    // ═══════════════════════════════════════
    // INFRASTRUCTURE (cross-cutting)
    // ═══════════════════════════════════════
    AppConfigModule,
    DatabaseModule,
    AppLoggerModule,
    HealthModule,
    AppI18nModule,
    AppEventEmitterModule,
    QueueModule,
    PrismaModule,
    MailModule,

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: config.get<number>('THROTTLE_TTL_MS', 15 * 60 * 1000),
            limit: config.get<number>('THROTTLE_LIMIT', 1000),
          },
          {
            name: 'auth',
            ttl: config.get<number>('THROTTLE_AUTH_TTL_MS', 15 * 60 * 1000),
            limit: config.get<number>('THROTTLE_AUTH_LIMIT', 20),
          },
        ],
      }),
    }),

    // ═══════════════════════════════════════
    // DOMAIN MODULES
    // ═══════════════════════════════════════
    AuthDomainModule,
    UserDomainModule,
    ProductDomainModule,
    CartDomainModule,
    OrderDomainModule,
    PaymentDomainModule,
    CommunicationDomainModule,
    ContentDomainModule,
    StorageDomainModule,
    EventDomainModule,
    AnalyticsDomainModule,
    CronDomainModule,
  ],
  providers: [
    // Global throttler guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Global CSRF protection
    { provide: APP_GUARD, useClass: CsrfGuard },
    // Global request tracing
    { provide: APP_INTERCEPTOR, useClass: TracingInterceptor },
  ],
})
export class AppModule {}
