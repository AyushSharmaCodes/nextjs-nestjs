import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountDeletionJob, AccountDeletionAudit } from './entities/deletion.entity';
import { DeletionService } from './deletion.service';
import { DeletionController } from './deletion.controller';
import { DeletionRepository } from './deletion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AccountDeletionJob, AccountDeletionAudit])],
  controllers: [DeletionController],
  providers: [DeletionService, DeletionRepository],
  exports: [DeletionService],
})
export class DeletionModule {}