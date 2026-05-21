import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AlertService } from './alert.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { AlertStatus, AlertType, AlertPriority } from './entities/alert.entity';
import { Roles } from '../../auth/decorators/roles.decorator';

interface GetAlertsQuery {
  status?: AlertStatus;
  type?: AlertType;
  priority?: AlertPriority;
}

interface CreateAlertBody {
  title: string;
  message: string;
  type: AlertType;
  priority: AlertPriority;
  userId?: string;
}

@Roles('ADMIN')
@Controller('admin/alerts')
export class AlertController {
  constructor(private readonly service: AlertService) {}

  @Get() async getAll(
    @Query('status') status?: AlertStatus,
    @Query('type') type?: AlertType,
    @Query('priority') priority?: AlertPriority,
  ) {
    const query: GetAlertsQuery = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    return ApiResponse.success(await this.service.getAll(query));
  }

  @Get('stats') async getStats() {
    return ApiResponse.success(await this.service.getStats());
  }

  @Get('unread-count') async getUnreadCount() {
    return ApiResponse.success({ count: await this.service.getUnreadCount() });
  }

  @Post() async create(@Body() body: CreateAlertBody) {
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
