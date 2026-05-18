import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { RealtimeModule } from './realtime/realtime.module';

/**
 * Analytics domain module.
 * Consolidates analytics and realtime sub-modules.
 */
@Module({
  imports: [AnalyticsModule, RealtimeModule],
  exports: [AnalyticsModule, RealtimeModule],
})
export class AnalyticsDomainModule {}
