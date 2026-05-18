import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSettings, SystemSwitch, AdminAlert, AdminNotification } from './entities/settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingsRepository } from './settings.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSettings, SystemSwitch, AdminAlert, AdminNotification])],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService],
})
export class SettingsModule {}