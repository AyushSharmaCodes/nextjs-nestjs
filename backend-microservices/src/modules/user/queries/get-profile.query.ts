import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class GetProfileQuery {
  constructor(private readonly repository: UserRepository) {}

  async execute(userId: string) {
    const profile = await this.repository.findProfileByUserId(userId);
    if (!profile) {
      throw new UserNotFoundException();
    }
    return profile;
  }
}
