import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAlert, AlertStatus } from './entities/alert.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(AdminAlert) private alertRepo: Repository<AdminAlert>,
  ) {}

  async create(data: Partial<AdminAlert>) {
    return this.alertRepo.save(this.alertRepo.create(data));
  }

  async getAll(filters?: { status?: AlertStatus; type?: string; priority?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.priority) where.priority = filters.priority;
    return this.alertRepo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  async getUnreadCount() {
    return this.alertRepo.count({ where: { status: AlertStatus.UNREAD } });
  }

  async markAsRead(id: string) {
    await this.alertRepo.update(id, { status: AlertStatus.READ });
    return this.alertRepo.findOne({ where: { id } });
  }

  async markAllAsRead() {
    await this.alertRepo.update({ status: AlertStatus.UNREAD }, { status: AlertStatus.READ });
  }

  async resolve(id: string, resolvedBy: string) {
    await this.alertRepo.update(id, { 
      status: AlertStatus.RESOLVED, 
      resolvedBy, 
      resolvedAt: new Date() 
    });
    return this.alertRepo.findOne({ where: { id } });
  }

  async delete(id: string) {
    return this.alertRepo.delete(id);
  }

  async getStats() {
    const total = await this.alertRepo.count();
    const unread = await this.alertRepo.count({ where: { status: AlertStatus.UNREAD } });
    const resolved = await this.alertRepo.count({ where: { status: AlertStatus.RESOLVED } });
    return { total, unread, resolved };
  }
}