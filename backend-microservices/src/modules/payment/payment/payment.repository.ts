import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentIntent } from './entities/payment.entity';
import Razorpay from 'razorpay';

interface RazorpayOrderCreate {
  amount: number;
  currency: string;
  notes?: Record<string, string>;
  expires_at?: number;
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string>;
  expires_at?: number;
}

@Injectable()
export class PaymentRepository {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(PaymentIntent) private intentRepo: Repository<PaymentIntent>,
    private config: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.config.get('RAZORPAY_KEY_ID', ''),
      key_secret: this.config.get('RAZORPAY_KEY_SECRET', ''),
    });
  }

  async createPaymentIntent(userId: string, amount: number, orderId?: string, notes?: Record<string, string>) {
    const orderOptions: RazorpayOrderCreate = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      notes: notes || {},
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    };
    const rzOrder = await this.razorpay.orders.create(orderOptions) as RazorpayOrderResponse;

    const intent = this.intentRepo.create({
      userId,
      orderId,
      razorpayOrderId: rzOrder.id,
      amount,
      status: 'CREATED',
      notes,
      expiresAt: rzOrder.expires_at ? new Date(rzOrder.expires_at * 1000) : new Date(Date.now() + 30 * 60 * 1000),
    });
    return this.intentRepo.save(intent);
  }

  async confirmPayment(razorpayPaymentId: string, razorpaySignature: string) {
    const intent = await this.intentRepo.findOne({ where: { razorpayPaymentId } });
    if (intent) {
      await this.intentRepo.update(intent.id, { razorpayPaymentId, razorpaySignature, status: 'CAPTURED', capturedAt: new Date() });
    }
    return intent;
  }

  async findById(id: string) { return this.intentRepo.findOne({ where: { id } }); }
  async findByOrderId(orderId: string) { return this.intentRepo.findOne({ where: { orderId } }); }
  async findByUserId(userId: string) { return this.intentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } }); }
  async updateStatus(id: string, status: string, errorCode?: string, errorDescription?: string) { return this.intentRepo.update(id, { status, errorCode, errorDescription }); }

  getRazorpayKeyId() { return this.config.get('RAZORPAY_KEY_ID'); }
}