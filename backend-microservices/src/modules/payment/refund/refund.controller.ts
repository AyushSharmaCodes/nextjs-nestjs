import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RefundService } from './refund.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('refunds')
export class RefundController {
  constructor(private readonly service: RefundService) {}

  @Post() async create(@Body() body: { paymentIntentId: string; amount: number; reason?: string; returnId?: string }) { return ApiResponse.success(await this.service.createRefund(body.paymentIntentId, body.amount, body.reason, body.returnId), 'Refund initiated'); }
  @Get(':id') async get(@Param('id') id: string) { return ApiResponse.success(await this.service.getRefund(id)); }
}