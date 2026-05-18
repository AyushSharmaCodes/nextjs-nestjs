import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async createPermission(action: string, resource: string, description?: string) {
    return this.prisma.permission.create({
      data: { action, resource, description },
    });
  }

  async getPermission(action: string, resource: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { action_resource: { action, resource } },
    });
    if (!permission) {
      throw new NotFoundException(`Permission ${action}:${resource} not found`);
    }
    return permission;
  }

  async assignPermissionToRole(roleId: string, action: string, resource: string) {
    const permission = await this.getPermission(action, resource);
    
    const existing = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId: permission.id } },
    });

    if (!existing) {
      return this.prisma.rolePermission.create({
        data: { roleId, permissionId: permission.id },
      });
    }
    return existing;
  }

  async getRolePermissions(roleId: string) {
    const rps = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rps.map((rp: any) => rp.permission);
  }

  async getUserPermissions(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    const permissions = new Map<string, string>(); // 'resource:action'
    
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        const key = `${rp.permission.resource}:${rp.permission.action}`;
        permissions.set(key, key);
      }
    }

    return Array.from(permissions.values());
  }
}
