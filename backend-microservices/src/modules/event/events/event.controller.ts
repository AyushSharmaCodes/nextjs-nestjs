import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

  @Controller('events')
export class EventController {
  constructor(private service: EventService) {}
  @Public()
  @Get() getAll(@Query('active') active?: boolean) { return ApiResponse.success(this.service.getEvents(active)); }
  @Public()
  @Get('featured') getFeatured() { return ApiResponse.success(this.service.getFeatured()); }
  @Public()
  @Get(':slug') getBySlug(@Param('slug') s: string) { return ApiResponse.success(this.service.getBySlug(s)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('events')
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); }
  @Public()
  @Post(':id/register') register(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.register(id, b)); }
}
