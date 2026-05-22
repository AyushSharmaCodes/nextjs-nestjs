import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS, UserCreatedEvent } from '../events/user.events';
import { UserRole } from '../types/user-role.enum';
import { ProfileAlreadyExistsException } from '../exceptions/profile-already-exists.exception';
import { Profile } from '@prisma/client';

@Injectable()
export class CreateProfileCommand {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, email: string, dto: CreateProfileDto): Promise<Profile> {
    const existing = await this.repository.findProfileByUserId(userId);
    if (existing) {
      throw new ProfileAlreadyExistsException();
    }

    const role = await this.repository.getRoleByName(UserRole.CUSTOMER);
    if (!role) {
      throw new Error('Default role not found in database');
    }

    const profile = await this.repository.createProfile({
      userId,
      roleId: role.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      locale: dto.locale || 'en',
      timezone: dto.timezone || 'UTC',
    });

    this.eventEmitter.emit(
      USER_EVENTS.CREATED,
      new UserCreatedEvent(profile.userId, role.name, profile.locale, profile.createdAt),
    );

    return profile;
  }
}
