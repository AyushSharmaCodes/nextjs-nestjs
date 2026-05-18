import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInfo } from './entities/contact-info.entity';

@Injectable()
export class ContactInfoService {
  constructor(
    @InjectRepository(ContactInfo) private repo: Repository<ContactInfo>,
  ) {}

  async getAll(publicOnly = true) {
    const where: any = { isActive: true };
    if (publicOnly) where.isPublic = true;
    return this.repo.find({ where, order: { displayOrder: 'ASC' } });
  }

  async getByKey(key: string) {
    return this.repo.findOne({ where: { key, isActive: true } });
  }

  async getByCategory(category: string) {
    return this.repo.find({ where: { category, isActive: true }, order: { displayOrder: 'ASC' } });
  }

  async create(data: Partial<ContactInfo>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ContactInfo>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}