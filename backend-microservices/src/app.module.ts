import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppConfigService } from './infrastructure/config/app-config.service';

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
import { AiModule } from './modules/ai/ai.module';
import { AuthDomainModule } from './modules/auth/auth-domain.module';
import { UserModule } from './modules/user/user.module';
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
import { CscModule } from './modules/csc/csc.module';
import { SupabaseModule } from './modules/supabase/supabase.module';

// Shared providers
import { TracingInterceptor } from './common/interceptors/tracing.interceptor';
import { CsrfGuard } from './common/guards/csrf.guard';
import { BetterAuthGuard } from './modules/auth/guards/better-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { ManagerPermissionsGuard } from './modules/auth/guards/manager-permissions.guard';

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

    // Rate limiting — configured via AppConfigService (typed, validated at startup)
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: cfg.throttleTtlMs,
            limit: cfg.throttleLimit,
          },
          {
            name: 'auth',
            ttl: cfg.throttleAuthTtlMs,
            limit: cfg.throttleAuthLimit,
          },
        ],
      }),
    }),

    // ═══════════════════════════════════════
    // DOMAIN MODULES
    // ═══════════════════════════════════════
    AiModule,
    AuthDomainModule,
    UserModule,
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
    CscModule,
    SupabaseModule,
  ],
  providers: [
    // Global throttler guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Global CSRF protection
    { provide: APP_GUARD, useClass: CsrfGuard },
    // Global Better Auth validation
    { provide: APP_GUARD, useClass: BetterAuthGuard },
    // Global RBAC metadata enforcement
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global fine-grained manager permission enforcement
    { provide: APP_GUARD, useClass: ManagerPermissionsGuard },
    // Global request tracing
    { provide: APP_INTERCEPTOR, useClass: TracingInterceptor },
  ],
})
export class AppModule {}
