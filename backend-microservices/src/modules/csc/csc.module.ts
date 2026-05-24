// src/modules/csc/csc.module.ts
import { Module } from '@nestjs/common';
import { CscController } from './csc.controller';
import { CscService } from './csc.service';
import { CscRepository } from './csc.repository';
import { CscSyncListener } from './listeners/csc-sync.listener';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { AppConfigModule } from '../../infrastructure/config/config.module';

@Module({
  imports: [PrismaModule, AppConfigModule],
  controllers: [CscController],
  providers: [CscService, CscRepository, CscSyncListener],
  exports: [CscService, CscRepository],
})
export class CscModule {}
