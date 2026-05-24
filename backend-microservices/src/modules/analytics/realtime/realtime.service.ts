import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealtimeEvent, RealtimeSubscription, RealtimeChannel, RealtimeEventType } from './entities/realtime.entity';

@Injectable()
export class RealtimeService {
  constructor(
    @InjectRepository(RealtimeEvent) private eventRepo: Repository<RealtimeEvent>,
    @InjectRepository(RealtimeSubscription) private subRepo: Repository<RealtimeSubscription>,
  ) {}

  async emit(event: RealtimeEventType, channel: RealtimeChannel, payload: any, userId?: string) { // ts-audit-ignore
    return this.eventRepo.save(this.eventRepo.create({
      event,
      channel,
      payload,
      userId,
      isBroadcast: !userId,
    }));
  }

  async getRecentEvents(channel?: RealtimeChannel, limit = 50) {
    const where: any = {}; // ts-audit-ignore
    if (channel) where.channel = channel;
    return this.eventRepo.find({ where, order: { createdAt: 'DESC' }, take: limit });
  }

  async subscribe(userId: string, channel: RealtimeChannel, socketId: string) {
    const existing = await this.subRepo.findOne({ 
      where: { userId, channel, socketId, isActive: true } 
    });
    if (existing) return existing;
    return this.subRepo.save(this.subRepo.create({ userId, channel, socketId }));
  }

  async unsubscribe(userId: string, channel?: RealtimeChannel, socketId?: string) {
    const where: any = { userId, isActive: true }; // ts-audit-ignore
    if (channel) where.channel = channel;
    if (socketId) where.socketId = socketId;
    await this.subRepo.update(where, { isActive: false });
  }

  async getActiveSubscriptions(channel?: RealtimeChannel) {
    const where: any = { isActive: true }; // ts-audit-ignore
    if (channel) where.channel = channel;
    return this.subRepo.find({ where });
  }
}