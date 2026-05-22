import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UserAddress } from '@prisma/client';

@Injectable()
export class DeleteAddressCommand {
  constructor(private readonly repository: UserRepository) {}

  async execute(userId: string, addressId: string): Promise<UserAddress> {
    const profile = await this.repository.findProfileByUserId(userId);
    if (!profile) {
      throw new UserNotFoundException();
    }

    const address = await this.repository.getAddress(addressId, profile.id);
    if (!address) {
      throw new Error('Address not found');
    }

    return this.repository.deleteAddress(addressId);
  }
}
