import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { ALLOWED_TRANSITIONS, ORDER_STATUS } from '../../../common/constants';

interface CreateOrderDto {
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: any[]; // ts-audit-ignore
  shippingAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  deliveryCharge?: number;
  deliveryGst?: number;
  couponDiscount?: number;
  paymentId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly historyRepo: Repository<OrderStatusHistory>,
  ) {}

  async create(data: CreateOrderDto): Promise<Order> {
    const orderNumber = `MGM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.pricePerUnit || 0) * (item.quantity || 1), 0); // ts-audit-ignore
    const totalAmount = subtotal + (data.deliveryCharge || 0) + (data.deliveryGst || 0) - (data.couponDiscount || 0);

    const order = this.orderRepo.create({
      orderNumber,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      status: ORDER_STATUS.CREATED,
      paymentStatus: 'PENDING',
      subtotal,
      deliveryCharge: data.deliveryCharge || 0,
      deliveryGst: data.deliveryGst || 0,
      couponDiscount: data.couponDiscount || 0,
      totalAmount,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      paymentId: data.paymentId,
      metadata: data.metadata,
    });

    const savedOrder = await this.orderRepo.save(order);

    const items = data.items.map((item: any) => // ts-audit-ignore
      this.itemRepo.create({
        orderId: savedOrder.id,
        productId: item.productId,
        variantId: item.variantId || null,
        sku: item.sku || null,
        title: item.title || '',
        quantity: item.quantity || 1,
        pricePerUnit: item.pricePerUnit || 0,
        hsnCode: item.hsnCode || null,
        gstRate: item.gstRate || 0,
        taxableAmount: item.taxableAmount || 0,
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        igst: item.igst || 0,
        deliveryCharge: item.deliveryCharge || 0,
        deliveryGst: item.deliveryGst || 0,
      }),
    );
    await this.itemRepo.save(items);

    return this.findById(savedOrder.id) as Promise<Order>;
  }

  async findById(id: string) {
    return this.orderRepo.findOne({ where: { id }, relations: ['items'] });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.orderRepo.findOne({ where: { orderNumber }, relations: ['items'] });
  }

  async findByUserId(userId: string, page = 1, limit = 20, status?: string) {
    const where = status ? { userId, status } : { userId };
    return this.orderRepo.find({ where, relations: ['items'], order: { createdAt: 'DESC' }, take: limit, skip: (page - 1) * limit });
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const where = status ? { status } : {};
    return this.orderRepo.find({ where, relations: ['items'], order: { createdAt: 'DESC' }, take: limit, skip: (page - 1) * limit });
  }

  async updateStatus(orderId: string, newStatus: string, actor = 'SYSTEM', notes?: string) {
    const order = await this.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${order.status} to ${newStatus}`);
    }

    await this.orderRepo.update(orderId, { status: newStatus });
    const history = this.historyRepo.create({ orderId, status: newStatus, eventType: 'STATUS_CHANGE', actor, notes });
    await this.historyRepo.save(history);

    return this.findById(orderId) as Promise<Order>;
  }

  async updatePaymentStatus(orderId: string, status: string, paymentId: string) {
    await this.orderRepo.update(orderId, { paymentStatus: status, paymentId });
    return this.findById(orderId);
  }
}