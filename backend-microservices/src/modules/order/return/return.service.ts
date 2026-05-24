import { Injectable } from '@nestjs/common';
import { ReturnRepository } from './return.repository';

@Injectable()
export class ReturnService {
  constructor(private readonly returnRepo: ReturnRepository) {}

  async createReturn(orderId: string, userId: string, items: any[], reason: string) { // ts-audit-ignore
    return this.returnRepo.create(orderId, userId, items, reason);
  }

  async getReturn(id: string) {
    return this.returnRepo.findById(id);
  }

  async getUserReturns(userId: string) {
    return this.returnRepo.findByUserId(userId);
  }

  async getPendingReturns() {
    return this.returnRepo.findPending();
  }

  async approveReturn(id: string, refundAmount: number) {
    return this.returnRepo.approve(id, refundAmount);
  }

  async rejectReturn(id: string) {
    return this.returnRepo.reject(id);
  }

  async completeReturn(id: string) {
    return this.returnRepo.complete(id);
  }

  async addQCResult(returnItemId: string, data: any) { // ts-audit-ignore
    return this.returnRepo.addQCResult(returnItemId, data);
  }
}