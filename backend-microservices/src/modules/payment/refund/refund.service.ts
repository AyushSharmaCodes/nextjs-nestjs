import { Injectable } from '@nestjs/common';
import { RefundRepository } from './refund.repository';

@Injectable()
export class RefundService {
  constructor(private readonly repo: RefundRepository) {}

  async createRefund(paymentIntentId: string, amount: number, reason?: string, returnId?: string) { return this.repo.create(paymentIntentId, amount, reason, 'FULL', returnId); }
  async getRefund(id: string) { return this.repo.findById(id); }
  async processRefund(id: string, razorpayRefundId: string) { return this.repo.process(id, razorpayRefundId); }
}