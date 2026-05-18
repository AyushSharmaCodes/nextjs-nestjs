import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('payments')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('create') async create(@Body() body: { userId: string; amount: number; orderId?: string; notes?: any }) { return ApiResponse.success(await this.service.createOrder(body.userId, body.amount, body.orderId), 'Payment initiated'); }
  @Get('key') async getKey() { return ApiResponse.success(await this.service.getRazorpayKey()); }
  @Get('user/:userId') async getByUser(@Param('userId') userId: string) { return ApiResponse.success(await this.service.getPaymentsByUser(userId)); }
  @Get(':id') async get(@Param('id') id: string) { return ApiResponse.success(await this.service.getPayment(id)); }
  @Post('confirm') async confirm(@Body() body: { razorpayPaymentId: string; razorpaySignature: string }) { return ApiResponse.success(await this.service.confirmPayment('', body.razorpayPaymentId, body.razorpaySignature), 'Payment confirmed'); }
}