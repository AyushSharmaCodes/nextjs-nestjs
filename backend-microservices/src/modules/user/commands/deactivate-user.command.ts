import { Injectable } from '@nestjs/common';
import { UserRepository, ProfileWithRole } from '../user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS, UserDeactivatedEvent } from '../events/user.events';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { Profile, Role } from '@prisma/client';

@Injectable()
export class DeactivateUserCommand {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(targetUserId: string, deactivatedByAdminId: string): Promise<ProfileWithRole> {
    const profile = await this.repository.findProfileByUserId(targetUserId);
    if (!profile) {
      throw new UserNotFoundException();
    }

    const updated = await this.repository.updateProfile(profile.id, {
      deletedAt: new Date(),
      isActive: false,
    });

    this.eventEmitter.emit(
      USER_EVENTS.DEACTIVATED,
      new UserDeactivatedEvent(updated.userId, deactivatedByAdminId, 'Admin deactivation', updated.updatedAt),
    );

    return updated;
  }
}
