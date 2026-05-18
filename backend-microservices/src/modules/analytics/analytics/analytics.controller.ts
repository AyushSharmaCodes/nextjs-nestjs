import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}
  @Get('audit') getAuditLogs(@Query('limit') limit?: number) { return ApiResponse.success(this.service.getAuditLogs(limit)); }
  @Get('requests') getRequestLogs(@Query('limit') limit?: number) { return ApiResponse.success(this.service.getRequestLogs(limit)); }
}