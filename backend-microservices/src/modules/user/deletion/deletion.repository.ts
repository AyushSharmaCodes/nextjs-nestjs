import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountDeletionJob, AccountDeletionAudit } from './entities/deletion.entity';

@Injectable()
export class DeletionRepository {
  constructor(
    @InjectRepository(AccountDeletionJob) private jobRepo: Repository<AccountDeletionJob>,
    @InjectRepository(AccountDeletionAudit) private auditRepo: Repository<AccountDeletionAudit>,
  ) {}

  async findByIdentity(identityId: string) { return this.jobRepo.findOne({ where: { identityId }, order: { createdAt: 'DESC' } }); }
  async findPending() { return this.jobRepo.find({ where: { status: 'PENDING' }, order: { requestedAt: 'ASC' } }); }
  
  async createJob(identityId: string, userId: string) {
    const job = this.jobRepo.create({ identityId, userId, status: 'REQUESTED' });
    const saved = await this.jobRepo.save(job);
    await this.addAudit(saved.id, identityId, 'REQUESTED');
    return saved;
  }

  async verifyOtp(jobId: string) {
    await this.jobRepo.update(jobId, { otpVerified: true, status: 'OTP_VERIFIED' });
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    await this.addAudit(jobId!, job!.identityId, 'OTP_VERIFIED');
    return job;
  }

  async scheduleDeletion(jobId: string, scheduledFor: Date) {
    await this.jobRepo.update(jobId, { status: 'SCHEDULED', scheduledFor });
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    await this.addAudit(jobId, job!.identityId, 'SCHEDULED');
    return job;
  }

  async markProcessing(jobId: string) {
    await this.jobRepo.update(jobId, { status: 'PROCESSING' });
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    await this.addAudit(jobId, job!.identityId, 'PROCESSING');
    return job;
  }

  async complete(jobId: string) {
    await this.jobRepo.update(jobId, { status: 'COMPLETED', completedAt: new Date() });
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    await this.addAudit(jobId, job!.identityId, 'COMPLETED');
    return job;
  }

  async fail(jobId: string, error: string) {
    await this.jobRepo.update(jobId, { status: 'FAILED', errorMessage: error, retryCount: () => 'retry_count + 1' });
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    await this.addAudit(jobId, job!.identityId, 'FAILED', { error });
    return job;
  }

  async cancel(jobId: string) {
    await this.jobRepo.update(jobId, { status: 'CANCELLED' });
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    await this.addAudit(jobId, job!.identityId, 'CANCELLED');
    return job;
  }

  private async addAudit(jobId: string, identityId: string, action: string, metadata?: any) {
    const audit = this.auditRepo.create({ deletionJobId: jobId, identityId, action, metadata });
    await this.auditRepo.save(audit);
  }
}