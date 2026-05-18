import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CronJob, JobRun, JobStatus, JobType, JobPriority } from './entities/job.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(CronJob) private jobRepo: Repository<CronJob>,
    @InjectRepository(JobRun) private runRepo: Repository<JobRun>,
  ) {}

  async createJob(data: {
    type: JobType;
    name: string;
    description?: string;
    payload?: any;
    scheduledAt?: Date;
    priority?: JobPriority;
    timeoutSeconds?: number;
    cronExpression?: string;
    isRecurring?: boolean;
    createdBy?: string;
  }) {
    const jobId = uuidv4();
    const nextRunAt = data.scheduledAt || new Date();
    
    const job = this.jobRepo.create({
      jobId,
      ...data,
      status: JobStatus.PENDING,
      nextRunAt,
    });
    
    return this.jobRepo.save(job);
  }

  async getJobs(filters?: { status?: JobStatus; type?: JobType; isActive?: boolean }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    
    return this.jobRepo.find({ where, order: { priority: 'DESC', createdAt: 'DESC' }, take: 100 });
  }

  async getJobById(id: string) {
    return this.jobRepo.findOne({ where: { id } });
  }

  async getJobByJobId(jobId: string) {
    return this.jobRepo.findOne({ where: { jobId } });
  }

  async getPendingJobs(limit = 50) {
    const now = new Date();
    return this.jobRepo
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.PENDING })
      .andWhere('(job.scheduledAt IS NULL OR job.scheduledAt <= :now)', { now })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .orderBy('job.priority', 'DESC')
      .addOrderBy('job.createdAt', 'ASC')
      .take(limit)
      .getMany();
  }

  async getRecurringJobs() {
    return this.jobRepo.find({
      where: { isRecurring: true, isActive: true },
      order: { nextRunAt: 'ASC' },
    });
  }

  async updateNextRun(jobId: string) {
    const job = await this.getJobByJobId(jobId);
    if (!job || !job.cronExpression) return null;
    
    const nextRun = this.calculateNextRun(job.cronExpression);
    await this.jobRepo.update(job.id, { 
      lastRunAt: new Date(),
      nextRunAt: nextRun,
    });
    
    return nextRun;
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simplified cron calculation - in production use a proper cron library
    // For now, default to 1 hour
    const next = new Date();
    next.setHours(next.getHours() + 1);
    return next;
  }

  async startJob(id: string) {
    await this.jobRepo.update(id, { 
      status: JobStatus.PROCESSING, 
      startedAt: new Date() 
    });
    
    const run = this.runRepo.create({
      jobId: (await this.getJobById(id))?.jobId || '',
      cronJobId: id,
      status: JobStatus.PROCESSING,
      payload: (await this.getJobById(id))?.payload,
      startedAt: new Date(),
    });
    await this.runRepo.save(run);
    
    return { job: await this.getJobById(id), run };
  }

  async completeJob(id: string, result: any) {
    const job = await this.getJobById(id);
    if (!job) return null;
    
    await this.jobRepo.update(id, { 
      status: JobStatus.COMPLETED, 
      completedAt: new Date(),
      result,
    });
    
    const runs = await this.runRepo.find({ where: { jobId: job.jobId, status: JobStatus.PROCESSING } });
    for (const run of runs) {
      await this.runRepo.update(run.id, { 
        status: JobStatus.COMPLETED, 
        completedAt: new Date(),
        result,
      });
    }
    
    // Handle recurring jobs
    if (job.isRecurring) {
      return this.updateNextRun(job.jobId);
    }
    
    return { job: await this.getJobById(id), result };
  }

  async failJob(id: string, error: string) {
    const job = await this.getJobById(id);
    if (!job) return null;
    
    if (job.retryCount < job.maxRetries) {
      await this.jobRepo.update(id, { 
        status: JobStatus.PENDING,
        error: null,
        retryCount: job.retryCount + 1,
        startedAt: null,
      });
    } else {
      await this.jobRepo.update(id, { status: JobStatus.FAILED, error });
    }
    
    const runs = await this.runRepo.find({ where: { jobId: job.jobId, status: JobStatus.PROCESSING } });
    for (const run of runs) {
      await this.runRepo.update(run.id, { 
        status: job.retryCount < job.maxRetries ? JobStatus.PENDING : JobStatus.FAILED, 
        error,
      });
    }
    
    return this.getJobById(id);
  }

  async cancelJob(id: string) {
    await this.jobRepo.update(id, { status: JobStatus.CANCELLED, isActive: false });
    return this.getJobById(id);
  }

  async deleteJob(id: string) {
    return this.jobRepo.delete(id);
  }

  async getStats() {
    const total = await this.jobRepo.count();
    const pending = await this.jobRepo.count({ where: { status: JobStatus.PENDING } });
    const processing = await this.jobRepo.count({ where: { status: JobStatus.PROCESSING } });
    const completed = await this.jobRepo.count({ where: { status: JobStatus.COMPLETED } });
    const failed = await this.jobRepo.count({ where: { status: JobStatus.FAILED } });
    const recurring = await this.jobRepo.count({ where: { isRecurring: true, isActive: true } });
    
    return { total, pending, processing, completed, failed, recurring };
  }

  async getJobRuns(jobId: string, limit = 20) {
    const job = await this.getJobByJobId(jobId);
    if (!job) return [];
    
    return this.runRepo.find({
      where: { jobId: job.jobId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async retryJob(id: string) {
    await this.jobRepo.update(id, { 
      status: JobStatus.PENDING, 
      retryCount: 0, 
      error: null,
      startedAt: null,
      completedAt: null,
    });
    return this.getJobById(id);
  }

  async pauseJob(id: string) {
    await this.jobRepo.update(id, { isActive: false });
    return this.getJobById(id);
  }

  async resumeJob(id: string) {
    await this.jobRepo.update(id, { isActive: true });
    return this.getJobById(id);
  }
}