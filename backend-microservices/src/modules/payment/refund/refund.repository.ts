import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refund } from '../payment/entities/payment.entity';
import Razorpay from 'razorpay';

interface RazorpayConfig {
  key_id: string;
  key_secret: string;
}

@Injectable()
export class RefundRepository {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Refund) private refundRepo: Repository<Refund>,
    private config: ConfigService,
  ) {
    const razorpayConfig: RazorpayConfig = {
      key_id: this.config.get('RAZORPAY_KEY_ID', ''),
      key_secret: this.config.get('RAZORPAY_KEY_SECRET', ''),
    };
    this.razorpay = new Razorpay(razorpayConfig);
  }

  async create(paymentIntentId: string, amount: number, reason?: string, type = 'FULL', returnId?: string) {
    const refund = this.refundRepo.create({ paymentIntentId, refundAmount: amount, reason, type, returnId, status: 'CREATED' });
    return this.refundRepo.save(refund);
  }

  async process(id: string, razorpayRefundId: string) {
    await this.refundRepo.update(id, { razorpayRefundId, status: 'COMPLETED', processedAt: new Date() });
    return this.refundRepo.findOne({ where: { id } });
  }

  async findById(id: string) { return this.refundRepo.findOne({ where: { id } }); }
  async findByPaymentIntent(paymentIntentId: string) { return this.refundRepo.find({ where: { paymentIntentId } }); }
  async findByReturn(returnId: string) { return this.refundRepo.findOne({ where: { returnId } }); }
}