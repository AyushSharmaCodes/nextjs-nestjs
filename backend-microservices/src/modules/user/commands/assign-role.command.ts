import { Injectable } from '@nestjs/common';
import { UserRepository, ProfileWithRole } from '../user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS, RoleChangedEvent } from '../events/user.events';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UnauthorizedRoleChangeException } from '../exceptions/unauthorized-role-change.exception';
import { AssignRoleDto } from '../dto/assign-role.dto';
import type { Profile, Role } from '@prisma/client';

@Injectable()
export class AssignRoleCommand {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(targetUserId: string, adminUserId: string, dto: AssignRoleDto): Promise<ProfileWithRole> {
    if (targetUserId === adminUserId) {
      throw new UnauthorizedRoleChangeException();
    }

    const profile = await this.repository.findProfileByUserId(targetUserId);
    if (!profile) {
      throw new UserNotFoundException();
    }

    const newRole = await this.repository.getRoleByName(dto.role);
    if (!newRole) {
      throw new Error(`Role ${dto.role} not found in database`);
    }

    const oldRoleName = profile.role.name;

    const updated = await this.repository.updateProfile(profile.id, {
      role: { connect: { id: newRole.id } },
    });

    this.eventEmitter.emit(
      USER_EVENTS.ROLE_CHANGED,
      new RoleChangedEvent(updated.userId, oldRoleName, newRole.name, adminUserId),
    );

    return updated;
  }
}
