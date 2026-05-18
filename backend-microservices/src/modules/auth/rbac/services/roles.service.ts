import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(name: string, description?: string, isSystem = false) {
    return this.prisma.role.create({
      data: { name, description, isSystem },
    });
  }

  async getRoleByName(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Role ${name} not found`);
    }
    return role;
  }

  async assignRoleToUser(userId: string, roleName: string) {
    const role = await this.getRoleByName(roleName);
    
    // Check if user already has role
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: role.id } },
    });
    
    if (!existing) {
      return this.prisma.userRole.create({
        data: { userId, roleId: role.id },
      });
    }
    return existing;
  }

  async getUserRoles(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur: any) => ur.role);
  }
}
