import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { ManagerPermissionDefinition, ManagerPermissionGrant, Prisma } from '@prisma/client';

type GrantWithPermission = ManagerPermissionGrant & { permission: ManagerPermissionDefinition };

@Injectable()
export class AdminManagerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPermissionDefinitions(): Promise<ManagerPermissionDefinition[]> {
    return this.prisma.managerPermissionDefinition.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getManagerGrants(managerProfileId: string): Promise<GrantWithPermission[]> {
    return this.prisma.managerPermissionGrant.findMany({
      where: { managerProfileId, isActive: true },
      include: { permission: true },
    }) as unknown as Promise<GrantWithPermission[]>;
  }

  async grantPermission(data: Prisma.ManagerPermissionGrantUncheckedCreateInput) {
    return this.prisma.managerPermissionGrant.upsert({
      where: {
        managerProfileId_permissionId: {
          managerProfileId: data.managerProfileId,
          permissionId: data.permissionId,
        },
      },
      update: {
        expiresAt: data.expiresAt,
        isActive: true,
        revokedAt: null,
        revokedByAdminId: null,
      },
      create: data,
    });
  }

  async revokePermission(managerProfileId: string, permissionId: string, adminId: string) {
    return this.prisma.managerPermissionGrant.update({
      where: {
        managerProfileId_permissionId: { managerProfileId, permissionId },
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedByAdminId: adminId,
      },
    });
  }

  async setPermissionExpiry(managerProfileId: string, permissionId: string, expiresAt: Date | null) {
    return this.prisma.managerPermissionGrant.update({
      where: {
        managerProfileId_permissionId: { managerProfileId, permissionId },
      },
      data: { expiresAt },
    });
  }
}
