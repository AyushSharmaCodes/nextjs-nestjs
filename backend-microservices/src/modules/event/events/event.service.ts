import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/registration.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event) private e: Repository<Event>,
    @InjectRepository(EventRegistration) private r: Repository<EventRegistration>,
  ) {}

  findById(id: string) { return this.e.findOne({ where: { id } }); }
  getEvents(active?: boolean) { return this.e.find({ where: active !== undefined ? { isActive: active } : undefined, order: { startDate: 'ASC' } }); }
  getFeatured() { return this.e.find({ where: { isFeatured: true, isActive: true }, order: { startDate: 'ASC' }, take: 5 }); }
  getBySlug(s: string) { return this.e.findOne({ where: { slug: s, isActive: true } }); }
  create(b: any) { return this.e.save(this.e.create(b)); }
  register(eventId: string, b: any) { return this.r.save(this.r.create({ eventId, ...b })); }
}