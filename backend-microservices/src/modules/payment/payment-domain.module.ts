import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { RefundModule } from './refund/refund.module';
import { WebhookModule } from './webhook/webhook.module';

/**
 * Payment domain module.
 * Consolidates payment, refund, and webhook sub-modules.
 */
@Module({
  imports: [PaymentModule, RefundModule, WebhookModule],
  exports: [PaymentModule, RefundModule, WebhookModule],
})
export class PaymentDomainModule {}
