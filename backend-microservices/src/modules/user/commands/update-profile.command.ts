import { Injectable } from '@nestjs/common';
import { UserRepository, ProfileWithRole } from '../user.repository';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS, UserUpdatedEvent } from '../events/user.events';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

import { Profile, Role, UserPhoneNumber } from '@prisma/client';

@Injectable()
export class UpdateProfileCommand {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<ProfileWithRole> {
    const profile = await this.repository.findProfileByUserId(userId);
    if (!profile) {
      throw new UserNotFoundException();
    }

    const updated = await this.repository.updateProfile(profile.id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      locale: dto.locale,
      timezone: dto.timezone,
      user: {
        update: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          dob: dto.dob ? new Date(dto.dob) : undefined,
          nationality: dto.nationality,
        }
      }
    });

    const changedFields = Object.keys(dto);
    if (changedFields.length > 0) {
      this.eventEmitter.emit(
        USER_EVENTS.UPDATED,
        new UserUpdatedEvent(updated.userId, changedFields, updated.updatedAt),
      );
    }

    return updated;
  }
}
