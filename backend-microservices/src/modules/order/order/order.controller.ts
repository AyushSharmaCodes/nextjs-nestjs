import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() data: any) {
    const order = await this.orderService.createOrder(data);
    return ApiResponse.success(order, 'Order created');
  }

  @Get()
  async getAll(@Query('page') page = '1', @Query('limit') limit = '20', @Query('status') status?: string) {
    const orders = await this.orderService.getAllOrders(Number(page), Number(limit), status);
    return ApiResponse.success(orders);
  }

  @Get('my')
  async getMyOrders(@Query('userId') userId: string, @Query('page') page = '1', @Query('limit') limit = '20', @Query('status') status?: string) {
    const orders = await this.orderService.getUserOrders(userId, Number(page), Number(limit), status);
    return ApiResponse.success(orders);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);
    return ApiResponse.success(order);
  }

  @Get('number/:orderNumber')
  async getByNumber(@Param('orderNumber') orderNumber: string) {
    const order = await this.orderService.getOrderByNumber(orderNumber);
    return ApiResponse.success(order);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; actor?: string; notes?: string }) {
    const order = await this.orderService.updateOrderStatus(id, body.status, body.actor, body.notes);
    return ApiResponse.success(order, 'Status updated');
  }

  @Put(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string, @Body() body: { paymentId: string }) {
    const order = await this.orderService.confirmPayment(id, body.paymentId);
    return ApiResponse.success(order, 'Payment confirmed');
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string) {
    const order = await this.orderService.cancelOrder(id);
    return ApiResponse.success(order, 'Order cancelled');
  }

  @Get(':id/transitions')
  async getTransitions(@Param('id') id: string) {
    const transitions = await this.orderService.getValidTransitions(id);
    return ApiResponse.success(transitions);
  }
}