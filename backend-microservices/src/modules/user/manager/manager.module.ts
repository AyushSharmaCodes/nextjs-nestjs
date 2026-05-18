import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manager, ManagerPermissions } from './entities/manager.entity';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { ManagerRepository } from './manager.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Manager, ManagerPermissions])],
  controllers: [ManagerController],
  providers: [ManagerService, ManagerRepository],
  exports: [ManagerService],
})
export class ManagerModule {}