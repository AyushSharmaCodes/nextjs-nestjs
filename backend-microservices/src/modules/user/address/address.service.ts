import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from './address.repository';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepo: AddressRepository) {}

  async getAddresses(userId: string) {
    return this.addressRepo.findByUserId(userId);
  }

  async getPrimaryAddress(userId: string) {
    return this.addressRepo.findPrimary(userId);
  }

  async getAddress(id: string) {
    const address = await this.addressRepo.findById(id);
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async createAddress(userId: string, data: any) {
    return this.addressRepo.create(userId, data);
  }

  async updateAddress(id: string, userId: string, data: any) {
    await this.getAddress(id);
    return this.addressRepo.update(id, userId, data);
  }

  async deleteAddress(id: string, userId: string) {
    const address = await this.getAddress(id);
    if (address.userId !== userId) throw new NotFoundException('Address not found');
    return this.addressRepo.delete(id);
  }

  async setPrimaryAddress(id: string, userId: string) {
    await this.getAddress(id);
    return this.addressRepo.setPrimary(id, userId);
  }
}