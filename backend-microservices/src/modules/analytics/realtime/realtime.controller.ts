import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { RealtimeService } from './realtime.service';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const ApiResponse = {
  success: <T>(data: T, message?: string): ApiResponse<T> => ({ success: true, data, message }),
};

@Controller('realtime')
export class RealtimeController {
  constructor(private readonly service: RealtimeService) {}

  @Get('events')
  async getEvents(@Query('channel') channel?: string, @Query('limit') limit = 50) {
    return ApiResponse.success(await this.service.getRecentEvents(channel as any, Number(limit)));
  }

  @Post('emit')
  async emit(@Body() body: { event: string; channel: string; payload: any; userId?: string }) {
    return ApiResponse.success(await this.service.emit(body.event as any, body.channel as any, body.payload, body.userId), 'Event emitted');
  }

  @Post('subscribe')
  async subscribe(@Body() body: { userId: string; channel: string; socketId: string }) {
    return ApiResponse.success(await this.service.subscribe(body.userId, body.channel as any, body.socketId), 'Subscribed');
  }

  @Delete('unsubscribe')
  async unsubscribe(@Body() body: { userId: string; channel?: string; socketId?: string }) {
    await this.service.unsubscribe(body.userId, body.channel as any, body.socketId);
    return ApiResponse.success(null, 'Unsubscribed');
  }

  @Get('subscriptions')
  async getSubscriptions(@Query('channel') channel?: string) {
    return ApiResponse.success(await this.service.getActiveSubscriptions(channel as any));
  }
}