import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly repo: PaymentRepository) {}

  async createOrder(userId: string, amount: number, orderId?: string) {
    return this.repo.createPaymentIntent(userId, amount, orderId);
  }

  async getPayment(id: string) { return this.repo.findById(id); }
  async getPaymentsByUser(userId: string) { return this.repo.findByUserId(userId); }
  async confirmPayment(paymentId: string, razorpayPaymentId: string, signature: string) { return this.repo.confirmPayment(razorpayPaymentId, signature); }
  async getRazorpayKey() { return { keyId: this.repo.getRazorpayKeyId() }; }
}