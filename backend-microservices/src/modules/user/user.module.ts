import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserStorageService } from './storage/user-storage.service';

import { CreateProfileCommand } from './commands/create-profile.command';
import { UpdateProfileCommand } from './commands/update-profile.command';
import { DeactivateUserCommand } from './commands/deactivate-user.command';
import { AssignRoleCommand } from './commands/assign-role.command';
import { DeleteAddressCommand } from './commands/delete-address.command';

import { GetProfileQuery } from './queries/get-profile.query';
import { ListUsersQuery } from './queries/list-users.query';
import { GetUserAddressesQuery } from './queries/get-user-addresses.query';
import { GetPermissionsForRoleQuery } from './queries/get-permissions-for-role.query';

import { AdminManagerController } from './admin/admin-manager.controller';
import { AdminManagerService } from './admin/admin-manager.service';
import { AdminManagerRepository } from './admin/admin-manager.repository';

// ResourceOwnerGuard is applied locally via @UseGuards(ResourceOwnerGuard) in UserController.
// RolesGuard is NOT registered here — the global RolesGuard from AppModule handles
// @Roles() metadata. Registering it locally would cause double DB lookups per request.
import { ResourceOwnerGuard } from './guards/resource-owner.guard';

// Interceptors and filters used by UserController via decorators
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { UserExceptionFilter } from './filters/user-exception.filter';

// ManagerService is used by the global ManagerPermissionsGuard (registered in AppModule).
// It must be exported so AppModule can resolve it when the guard is instantiated.
import { ManagerService } from './manager/manager.service';

@Module({
  controllers: [UserController, AdminManagerController],
  providers: [
    UserService,
    UserRepository,
    UserStorageService,
    CreateProfileCommand,
    UpdateProfileCommand,
    DeactivateUserCommand,
    AssignRoleCommand,
    DeleteAddressCommand,
    GetProfileQuery,
    ListUsersQuery,
    GetUserAddressesQuery,
    GetPermissionsForRoleQuery,
    AdminManagerService,
    AdminManagerRepository,
    // Guard applied locally via @UseGuards(ResourceOwnerGuard) in UserController
    ResourceOwnerGuard,
    // Interceptors and filters used via decorators
    AuditLogInterceptor,
    UserExceptionFilter,
    // Required by ManagerPermissionsGuard (global guard in AppModule)
    ManagerService,
  ],
  exports: [UserService, UserRepository, ManagerService],
})
export class UserModule {}
