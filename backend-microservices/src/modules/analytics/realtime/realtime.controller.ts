import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { RealtimeChannel, RealtimeEventType } from './entities/realtime.entity';

interface ApiResponse<T = Record<string, string | number | boolean | null>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface EmitBody {
  event: RealtimeEventType;
  channel: RealtimeChannel;
  payload: Record<string, string | number | boolean | null>;
  userId?: string;
}

interface SubscribeBody {
  userId: string;
  channel: RealtimeChannel;
  socketId: string;
}

interface UnsubscribeBody {
  userId: string;
  channel?: RealtimeChannel;
  socketId?: string;
}

const ApiResponse = {
  success: <T>(data: T, message?: string): ApiResponse<T> => ({ success: true, data, message }),
};

@Controller('realtime')
export class RealtimeController {
  constructor(private readonly service: RealtimeService) {}

  @Get('events')
  async getEvents(@Query('channel') channel: RealtimeChannel, @Query('limit') limit = 50) {
    return ApiResponse.success(await this.service.getRecentEvents(channel, Number(limit)));
  }

  @Post('emit')
  async emit(@Body() body: EmitBody) {
    return ApiResponse.success(await this.service.emit(body.event, body.channel, body.payload, body.userId), 'Event emitted');
  }

  @Post('subscribe')
  async subscribe(@Body() body: SubscribeBody) {
    return ApiResponse.success(await this.service.subscribe(body.userId, body.channel, body.socketId), 'Subscribed');
  }

  @Delete('unsubscribe')
  async unsubscribe(@Body() body: UnsubscribeBody) {
    if (body.channel && body.socketId) {
      await this.service.unsubscribe(body.userId, body.channel, body.socketId);
    }
    return ApiResponse.success(null, 'Unsubscribed');
  }

  @Get('subscriptions')
  async getSubscriptions(@Query('channel') channel: RealtimeChannel) {
    return ApiResponse.success(await this.service.getActiveSubscriptions(channel));
  }
}