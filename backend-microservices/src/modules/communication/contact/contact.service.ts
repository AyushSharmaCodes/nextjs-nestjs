import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../email/entities/email.entity';

@Injectable()
export class ContactService {
  constructor(@InjectRepository(ContactMessage) private repo: Repository<ContactMessage>) {}
  async createMessage(data: any) { return this.repo.save(this.repo.create(data)); }
  async getMessages(status?: string) { return this.repo.find({ where: status ? { status } : undefined, order: { createdAt: 'DESC' } }); }
  async updateStatus(id: string, status: string) { await this.repo.update(id, { status }); return this.repo.findOne({ where: { id } }); }
}