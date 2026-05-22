import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { AdminManagerRepository } from '../admin/admin-manager.repository';

@Injectable()
export class ManagerService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly adminRepo: AdminManagerRepository,
  ) {}

  async hasAnyPermission(userId: string, permissionSlugs: string[]): Promise<boolean> {
    const profile = await this.userRepo.findProfileByUserId(userId);
    if (!profile) return false;

    const grants = await this.adminRepo.getManagerGrants(profile.id);
    const now = new Date();

    return grants.some(
      (grant) =>
        grant.isActive &&
        (grant.expiresAt === null || grant.expiresAt > now) &&
        permissionSlugs.includes(grant.permission.slug),
    );
  }
}