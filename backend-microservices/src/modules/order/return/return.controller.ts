import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ReturnService } from './return.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  async createReturn(@Body() body: { orderId: string; userId: string; items: any[]; reason: string }) { // ts-audit-ignore
    const ret = await this.returnService.createReturn(body.orderId, body.userId, body.items, body.reason);
    return ApiResponse.success(ret, 'Return request created');
  }

  @Get()
  async getReturns(@Query('userId') userId?: string) {
    const returns = userId ? await this.returnService.getUserReturns(userId) : await this.returnService.getPendingReturns();
    return ApiResponse.success(returns);
  }

  @Get('pending')
  async getPending() {
    const returns = await this.returnService.getPendingReturns();
    return ApiResponse.success(returns);
  }

  @Get(':id')
  async getReturn(@Param('id') id: string) {
    const ret = await this.returnService.getReturn(id);
    return ApiResponse.success(ret);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Body() body: { refundAmount: number }) {
    const ret = await this.returnService.approveReturn(id, body.refundAmount);
    return ApiResponse.success(ret, 'Return approved');
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string) {
    const ret = await this.returnService.rejectReturn(id);
    return ApiResponse.success(ret, 'Return rejected');
  }

  @Put(':id/complete')
  async complete(@Param('id') id: string) {
    const ret = await this.returnService.completeReturn(id);
    return ApiResponse.success(ret, 'Return completed');
  }

  @Post(':id/qc')
  async addQC(@Param('id') id: string, @Body() body: any) { // ts-audit-ignore
    const qc = await this.returnService.addQCResult(id, body);
    return ApiResponse.success(qc, 'QC result added');
  }
}