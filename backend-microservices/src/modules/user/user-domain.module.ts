import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { AddressModule } from './address/address.module';
import { ManagerModule } from './manager/manager.module';
import { SettingsModule } from './settings/settings.module';
import { DeletionModule } from './deletion/deletion.module';

/**
 * User domain module.
 * Consolidates profile, address, manager, settings, and deletion sub-modules.
 */
@Module({
  imports: [
    ProfileModule,
    AddressModule,
    ManagerModule,
    SettingsModule,
    DeletionModule,
  ],
  exports: [ProfileModule, AddressModule, ManagerModule, SettingsModule, DeletionModule],
})
export class UserDomainModule {}
