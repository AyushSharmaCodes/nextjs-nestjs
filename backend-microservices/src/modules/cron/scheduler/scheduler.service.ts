import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobService } from '../jobs/job.service';
import { JobType, JobPriority } from '../jobs/entities/job.entity';
import { DomainEvents } from '../../../common/events/event-names';
import { CscEventPayload } from '../../../common/events/event-payloads';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly jobService: JobService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron('0 2 1 * *') // At 02:00 UTC on the 1st of every month
  async triggerMonthlyCscSync() {
    this.logger.log('Triggering monthly Country Sync event...');
    const payload: CscEventPayload = {
      triggeredBy: 'cron_scheduler',
      timestamp: new Date().toISOString(),
    };
    this.eventEmitter.emit(DomainEvents.CSC.SYNC_TRIGGERED, payload);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCronJobs() {
    this.logger.debug('Checking for pending jobs...');
    
    const pendingJobs = await this.jobService.getPendingJobs(10);
    
    for (const job of pendingJobs) {
      try {
        this.logger.log(`Processing job: ${job.name} (${job.jobId})`);
        await this.jobService.startJob(job.id);
        
        // Simulate job processing - in production, call actual job handlers
        await this.processJob(job);
        
      } catch (error: unknown) {
        this.logger.error(`Job failed: ${job.jobId}`, error);
        await this.jobService.failJob(job.id, String(error));
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleRecurringJobs() {
    this.logger.debug('Checking for recurring jobs...');
    
    const recurringJobs = await this.jobService.getRecurringJobs();
    const now = new Date();
    
    for (const job of recurringJobs) {
      if (job.nextRunAt && job.nextRunAt <= now) {
        try {
          this.logger.log(`Triggering recurring job: ${job.name} (${job.jobId})`);
          
          const newJob = await this.jobService.createJob({
            type: job.type as JobType,
            name: job.name,
            description: job.description || undefined,
            payload: job.payload,
            priority: job.priority as JobPriority,
            timeoutSeconds: job.timeoutSeconds || undefined,
            createdBy: 'system',
          });
          
          await this.jobService.startJob(newJob.id);
          await this.processJob(newJob);
          
        } catch (error: unknown) {
          this.logger.error(`Recurring job failed: ${job.jobId}`, error);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldJobs() {
    this.logger.debug('Cleaning up old completed jobs...');
    // Could implement cleanup logic here
  }

  private async processJob(job: any): Promise<void> { // ts-audit-ignore
    // Simulate processing - in production this would dispatch to appropriate handlers
    this.logger.log(`Processing job type: ${job.type}`);
    
    switch (job.type) {
      case JobType.EMAIL:
        // Handle email job
        break;
      case JobType.WEBHOOK:
        // Handle webhook job
        break;
      case JobType.SYNC:
        // Handle sync job
        break;
      case JobType.CLEANUP:
        // Handle cleanup job
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.type}`);
    }
    
    // Mark as completed
    await this.jobService.completeJob(job.id, { processed: true, timestamp: new Date() });
  }
}