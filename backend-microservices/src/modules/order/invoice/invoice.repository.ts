import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(orderId: string): Promise<Invoice> {
    const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = this.invoiceRepo.create({
      orderId,
      invoiceNumber,
      fileType: 'pdf',
      generatedAt: new Date(),
    });

    return this.invoiceRepo.save(invoice);
  }

  async findByOrderId(orderId: string) {
    return this.invoiceRepo.findOne({ where: { orderId } });
  }

  async findById(id: string) {
    return this.invoiceRepo.findOne({ where: { id } });
  }

  async updateUrl(id: string, url: string, storagePath: string) {
    await this.invoiceRepo.update(id, { invoiceUrl: url, storagePath });
    return this.findById(id);
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const shortYear = year.toString().slice(-2);
    const nextYear = (year + 1).toString().slice(-2);
    const prefix = `MGM/${shortYear}-${nextYear}/`;

    const lastInvoice = await this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.invoiceNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('inv.invoiceNumber', 'DESC')
      .getOne();

    let seq = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.invoiceNumber.split('/')[2] || '0');
      seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(5, '0')}`;
  }
}