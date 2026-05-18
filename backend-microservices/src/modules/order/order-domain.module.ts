import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { ReturnModule } from './return/return.module';
import { InvoiceModule } from './invoice/invoice.module';

/**
 * Order domain module.
 * Consolidates order, return, and invoice sub-modules.
 */
@Module({
  imports: [OrderModule, ReturnModule, InvoiceModule],
  exports: [OrderModule, ReturnModule, InvoiceModule],
})
export class OrderDomainModule {}
