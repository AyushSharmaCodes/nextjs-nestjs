import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AlertService } from './alert.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('admin/alerts')
export class AlertController {
  constructor(private readonly service: AlertService) {}

  @Get() async getAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
  ) {
    return ApiResponse.success(await this.service.getAll({ status: status as any, type, priority }));
  }

  @Get('stats') async getStats() {
    return ApiResponse.success(await this.service.getStats());
  }

  @Get('unread-count') async getUnreadCount() {
    return ApiResponse.success({ count: await this.service.getUnreadCount() });
  }

  @Post() async create(@Body() body: any) {
    return ApiResponse.success(await this.service.create(body), 'Alert created');
  }

  @Put(':id/read') async markAsRead(@Param('id') id: string) {
    return ApiResponse.success(await this.service.markAsRead(id), 'Marked as read');
  }

  @Put('read-all') async markAllAsRead() {
    await this.service.markAllAsRead();
    return ApiResponse.success(null, 'All marked as read');
  }

  @Put(':id/resolve') async resolve(@Param('id') id: string, @Body() body: { resolvedBy: string }) {
    return ApiResponse.success(await this.service.resolve(id, body.resolvedBy), 'Alert resolved');
  }

  @Delete(':id') async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.success(null, 'Alert deleted');
  }
}