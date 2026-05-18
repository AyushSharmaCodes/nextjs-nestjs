import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankDetail } from './entities/bank-details.entity';

@Injectable()
export class BankDetailsService {
  constructor(
    @InjectRepository(BankDetail) private repo: Repository<BankDetail>,
  ) {}

  async getAll() {
    return this.repo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
  }

  async getDefault() {
    return this.repo.findOne({ where: { isDefault: true, isActive: true } });
  }

  async getById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<BankDetail>) {
    if (data.isDefault) {
      await this.repo.update({ isDefault: true }, { isDefault: false });
    }
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<BankDetail>) {
    if (data.isDefault) {
      await this.repo.update({ isDefault: true }, { isDefault: false });
    }
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }

  async setDefault(id: string) {
    await this.repo.update({ isDefault: true }, { isDefault: false });
    await this.repo.update(id, { isDefault: true });
    return this.repo.findOne({ where: { id } });
  }
}