import { Injectable } from '@nestjs/common';
import { DeletionRepository } from './deletion.repository';

@Injectable()
export class DeletionService {
  constructor(private readonly repo: DeletionRepository) {}

  async checkEligibility(identityId: string) {
    const existing = await this.repo.findByIdentity(identityId);
    if (existing && ['REQUESTED', 'OTP_VERIFIED', 'SCHEDULED', 'PROCESSING'].includes(existing.status)) {
      return { eligible: false, reason: 'Deletion already in progress', status: existing.status };
    }
    return { eligible: true };
  }

  async getStatus(identityId: string) { return this.repo.findByIdentity(identityId); }
  async requestDeletion(identityId: string, userId: string) { return this.repo.createJob(identityId, userId); }
  async verifyOtp(jobId: string) { return this.repo.verifyOtp(jobId); }
  async scheduleDeletion(jobId: string, days = 7) { return this.repo.scheduleDeletion(jobId, new Date(Date.now() + days * 24 * 60 * 60 * 1000)); }
  async confirmDeletion(jobId: string) { return this.repo.markProcessing(jobId); }
  async processDeletion(jobId: string) { return this.repo.complete(jobId); }
  async cancelDeletion(jobId: string) { return this.repo.cancel(jobId); }
  async processPending() { return this.repo.findPending(); }
}