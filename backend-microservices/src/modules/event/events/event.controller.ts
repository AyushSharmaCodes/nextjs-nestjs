import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('events')
export class EventController {
  constructor(private service: EventService) {}
  @Get() getAll(@Query('active') active?: boolean) { return ApiResponse.success(this.service.getEvents(active)); }
  @Get(':slug') getBySlug(@Param('slug') s: string) { return ApiResponse.success(this.service.getBySlug(s)); }
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); }
  @Post(':id/register') register(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.register(id, b)); }
}