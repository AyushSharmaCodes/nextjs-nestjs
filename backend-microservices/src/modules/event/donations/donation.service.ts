import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Donation } from './entities/donation.entity';

@Injectable()
export class DonationService {
  constructor(@InjectRepository(Donation) private repo: Repository<Donation>) {}

  getAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  
  async create(b: DeepPartial<Donation>): Promise<Donation> {
    const entity = this.repo.create(b);
    return this.repo.save(entity);
  }

  async getStats(eventId?: string): Promise<{ total: number; count: number; currency: string }> {
    const query = this.repo
      .createQueryBuilder('d')
      .select('SUM(d.amount)', 'total')
      .addSelect('COUNT(d.id)', 'count');

    if (eventId) {
      query.where('d.eventId = :eventId', { eventId });
    }

    const result = await query.getRawOne<{ total: string | null; count: string }>();
    
    return {
      total: Number(result?.total ?? 0),
      count: Number(result?.count ?? 0),
      currency: 'INR',
    };
  }
}