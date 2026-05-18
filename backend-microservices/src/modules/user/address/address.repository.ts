import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressRepository {
  constructor(@InjectRepository(Address) private addressRepo: Repository<Address>) {}

  async findByUserId(userId: string) {
    return this.addressRepo.find({ where: { userId }, order: { isPrimary: 'DESC', createdAt: 'DESC' } });
  }

  async findById(id: string) {
    return this.addressRepo.findOne({ where: { id } });
  }

  async findPrimary(userId: string) {
    return this.addressRepo.findOne({ where: { userId, isPrimary: true } });
  }

  async create(userId: string, data: Partial<Address>) {
    if (data.isPrimary) {
      await this.addressRepo.update({ userId, isPrimary: true }, { isPrimary: false });
    }
    const address = this.addressRepo.create({ ...data, userId });
    return this.addressRepo.save(address);
  }

  async update(id: string, userId: string, data: Partial<Address>) {
    if (data.isPrimary) {
      await this.addressRepo.update({ userId, isPrimary: true }, { isPrimary: false });
    }
    await this.addressRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.addressRepo.delete(id);
  }

  async setPrimary(id: string, userId: string) {
    await this.addressRepo.update({ userId, isPrimary: true }, { isPrimary: false });
    await this.addressRepo.update(id, { isPrimary: true });
    return this.findById(id);
  }
}