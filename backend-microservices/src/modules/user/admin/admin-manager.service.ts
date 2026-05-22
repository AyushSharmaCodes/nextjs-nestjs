import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminManagerRepository } from './admin-manager.repository';
import { UserRepository } from '../user.repository';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRole } from '../types/user-role.enum';
import { USER_EVENTS, UserCreatedEvent } from '../events/user.events';
// Note: Actual implementation would require creating the user in Auth module (or Better Auth) 
// before creating the profile here. This service assumes userId is provided or it handles the profile part.

@Injectable()
export class AdminManagerService {
  constructor(
    private readonly adminRepo: AdminManagerRepository,
    private readonly userRepo: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createManager(adminId: string, userId: string, dto: CreateProfileDto) {
    // In a real flow, you might call authService.createUser here first.
    const role = await this.userRepo.getRoleByName(UserRole.MANAGER);
    if (!role) throw new Error('Manager role not found');
    
    const profile = await this.userRepo.createProfile({
      userId,
      roleId: role.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      locale: dto.locale,
      timezone: dto.timezone,
    });

    this.eventEmitter.emit(
      USER_EVENTS.CREATED,
      new UserCreatedEvent(userId, UserRole.MANAGER, profile.locale, profile.createdAt)
    );

    return profile;
  }

  async getManagerPermissions(managerId: string) {
    const profile = await this.userRepo.findProfileById(managerId);
    if (!profile) throw new NotFoundException('Manager not found');
    return this.adminRepo.getManagerGrants(managerId);
  }

  async getPermissionDefinitions() {
    return this.adminRepo.listPermissionDefinitions();
  }

  async grantPermissions(managerId: string, adminId: string, permissionSlugs: string[], expiresAt?: Date) {
    const definitions = await this.adminRepo.listPermissionDefinitions();
    
    for (const slug of permissionSlugs) {
      const def = definitions.find(d => d.slug === slug);
      if (def) {
        await this.adminRepo.grantPermission({
          managerProfileId: managerId,
          permissionId: def.id,
          grantedByAdminId: adminId,
          expiresAt: expiresAt || null,
        });
      }
    }
    return this.getManagerPermissions(managerId);
  }

  async revokePermissions(managerId: string, adminId: string, permissionSlugs: string[]) {
    const definitions = await this.adminRepo.listPermissionDefinitions();
    
    for (const slug of permissionSlugs) {
      const def = definitions.find(d => d.slug === slug);
      if (def) {
        await this.adminRepo.revokePermission(managerId, def.id, adminId);
      }
    }
    return this.getManagerPermissions(managerId);
  }

  async setExpiry(managerId: string, slug: string, expiresAt: Date | null) {
    const definitions = await this.adminRepo.listPermissionDefinitions();
    const def = definitions.find(d => d.slug === slug);
    if (def) {
      await this.adminRepo.setPermissionExpiry(managerId, def.id, expiresAt);
    }
  }
}
