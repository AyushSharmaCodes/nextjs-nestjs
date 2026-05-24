import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookLog } from '../payment/entities/payment.entity';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookLog) private logRepo: Repository<WebhookLog>,
    private config: ConfigService,
  ) {}

  async processWebhook(payload: any, signature: string) { // ts-audit-ignore
    const expectedSignature = crypto.createHmac('sha256', this.config.get('RAZORPAY_WEBHOOK_SECRET', ''))
      .update(JSON.stringify(payload)).digest('hex');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    const existing = await this.logRepo.findOne({ where: { razorpayEventId: payload.id } });
    if (existing) { return { duplicate: true }; }

    const log = this.logRepo.create({
      eventType: payload.event,
      razorpayEventId: payload.id,
      payload,
      processed: false,
    });
    await this.logRepo.save(log);

    const result = await this.handleEvent(payload);
    await this.logRepo.update(log.id, { processed: true });
    return result;
  }

  private async handleEvent(payload: any) { // ts-audit-ignore
    const event = payload.event;
    const data = payload.payload?.payment?.entity || payload.payload?.refund?.entity;

    switch (event) {
      case 'payment.captured':
        return { event: 'PAYMENT_CAPTURED', data };
      case 'payment.failed':
        return { event: 'PAYMENT_FAILED', data };
      case 'refund.created':
        return { event: 'REFUND_CREATED', data };
      case 'refund.processed':
        return { event: 'REFUND_PROCESSED', data };
      default:
        return { event: 'UNKNOWN', data };
    }
  }

  async getLogs(processed?: boolean) {
    return this.logRepo.find({ where: processed !== undefined ? { processed } : undefined, order: { createdAt: 'DESC' }, take: 100 });
  }
}