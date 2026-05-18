import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.bootstrapRoles();
    await this.bootstrapAdmin();
  }

  private async bootstrapRoles() {
    const roles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'];
    
    for (const roleName of roles) {
      const exists = await this.prisma.role.findUnique({ where: { name: roleName } });
      if (!exists) {
        await this.prisma.role.create({
          data: {
            name: roleName,
            description: `System defined ${roleName} role`,
            isSystem: true,
          },
        });
        this.logger.log(`Created system role: ${roleName}`);
      }
    }
  }

  private async bootstrapAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@merigaumata.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await bcryptjs.hash(adminPassword, 12);
      
      const admin = await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          emailVerified: true,
          requiresPasswordChange: true, // Force password change on first login
        },
      });

      const superAdminRole = await this.prisma.role.findUnique({
        where: { name: 'SUPER_ADMIN' },
      });

      if (superAdminRole) {
        await this.prisma.userRole.create({
          data: {
            userId: admin.id,
            roleId: superAdminRole.id,
          },
        });
      }

      this.logger.log(`Bootstrapped initial SUPER_ADMIN account: ${adminEmail}`);
    }
  }
}
