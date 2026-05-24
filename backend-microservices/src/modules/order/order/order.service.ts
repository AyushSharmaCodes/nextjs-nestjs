import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { ALLOWED_TRANSITIONS } from '../../../common/constants';

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
export class OrderService {
  constructor(private readonly orderRepo: OrderRepository) {}

  async createOrder(data: CreateOrderDto) {
    return this.orderRepo.create(data);
  }

  async getOrderById(id: string) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.orderRepo.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 20, status?: string) {
    return this.orderRepo.findByUserId(userId, page, limit, status);
  }

  async getAllOrders(page = 1, limit = 20, status?: string) {
    return this.orderRepo.findAll(page, limit, status);
  }

  async updateOrderStatus(orderId: string, newStatus: string, actor = 'SYSTEM', notes?: string) {
    return this.orderRepo.updateStatus(orderId, newStatus, actor, notes);
  }

  async confirmPayment(orderId: string, paymentId: string) {
    const order = await this.orderRepo.updatePaymentStatus(orderId, 'CAPTURED', paymentId);
    if (!order) throw new NotFoundException('Order not found');
    return this.orderRepo.updateStatus(order.id, 'CONFIRMED', 'SYSTEM', 'Payment confirmed');
  }

  async cancelOrder(orderId: string) {
    return this.orderRepo.updateStatus(orderId, 'CANCELLED', 'USER', 'Order cancelled by user');
  }

  async getValidTransitions(orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    return ALLOWED_TRANSITIONS[order.status] || [];
  }
}