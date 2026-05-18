import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from './invoice.repository';

@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepo: InvoiceRepository) {}

  async generateInvoice(orderId: string) {
    const existing = await this.invoiceRepo.findByOrderId(orderId);
    if (existing) {
      return this.invoiceRepo.findById(existing.id);
    }
    return this.invoiceRepo.create(orderId);
  }

  async getInvoiceByOrderId(orderId: string) {
    return this.invoiceRepo.findByOrderId(orderId);
  }

  async getInvoiceById(id: string) {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateInvoiceUrl(invoiceId: string, url: string, storagePath: string) {
    return this.invoiceRepo.updateUrl(invoiceId, url, storagePath);
  }
}