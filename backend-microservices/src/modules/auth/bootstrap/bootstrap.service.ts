import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { SuspiciousSessionService } from '../session/suspicious-session.service';
import { GlobalSuspiciousSessionDispatcher } from '../../../infrastructure/events/global-suspicious-session-dispatcher';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
    private readonly suspiciousSessionService: SuspiciousSessionService,
  ) {}

  async onModuleInit() {
    // Wire SuspiciousSessionService into the Better Auth hooks bridge
    GlobalSuspiciousSessionDispatcher.setService(this.suspiciousSessionService);
    await this.bootstrapAdmin();
  }


  private async bootstrapAdmin() {
    const adminEmail = this.appConfig.adminEmail;
    const adminPassword = this.appConfig.adminPassword;

    // Warn if the password looks like a known weak default value
    if (adminPassword === 'admin123' || adminPassword === 'ChangeMe123!') {
      this.logger.warn(
        '⚠️  [Security] ADMIN_PASSWORD is using a known weak default. ' +
        'Set a strong ADMIN_PASSWORD in your environment variables before deploying to production.',
      );
    }

    let admin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      admin = await this.prisma.user.create({
        data: {
          email: adminEmail,
          firstName: 'Admin',
          lastName: 'User',
          emailVerified: false,
          role: 'ADMIN',
        },
      });
      this.logger.log(`Created initial admin user record: ${adminEmail}`);
    }


    // Bootstrap the password account if it doesn't exist
    const existingAccount = await this.prisma.account.findFirst({
      where: {
        userId: admin.id,
        providerId: 'credential',
      },
    });

    if (!existingAccount) {
      const passwordHash = await bcryptjs.hash(adminPassword, 12);
      await this.prisma.account.create({
        data: {
          userId: admin.id,
          accountId: admin.id,
          providerId: 'credential',
          password: passwordHash,
        },
      });
      this.logger.log(`Bootstrapped password account for admin user: ${adminEmail}`);
    }
  }
}
