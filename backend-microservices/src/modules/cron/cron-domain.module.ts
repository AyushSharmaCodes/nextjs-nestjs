import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './jobs/job.module';
import { SchedulerModule } from './scheduler/scheduler.module';

/**
 * Cron domain module.
 * Consolidates scheduled jobs and scheduler sub-modules.
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    JobModule,
    SchedulerModule,
  ],
  exports: [JobModule, SchedulerModule],
})
export class CronDomainModule {}
