import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, UseFilters, UseInterceptors } from '@nestjs/common';
import { AdminManagerService } from './admin-manager.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../types/user-role.enum';
import { UserRequest } from '../interfaces/user-request.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Managers')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('admin/managers')
export class AdminManagerController {
  constructor(private readonly adminManagerService: AdminManagerService) {}

  @Get('permissions/definitions')
  @Roles(UserRole.ADMIN)
  async getPermissionDefinitions() {
    return this.adminManagerService.getPermissionDefinitions();
  }

  @Get(':id/permissions')
  @Roles(UserRole.ADMIN)
  async getManagerPermissions(@Param('id') managerId: string) {
    return this.adminManagerService.getManagerPermissions(managerId);
  }

  @Post(':id/permissions')
  @Roles(UserRole.ADMIN)
  async grantPermissions(
    @Req() req: UserRequest,
    @Param('id') managerId: string,
    @Body() body: { permissionSlugs: string[]; expiresAt?: Date }
  ) {
    const adminProfileId = req.user.profileId; // Assuming request sets this
    return this.adminManagerService.grantPermissions(managerId, adminProfileId, body.permissionSlugs, body.expiresAt);
  }

  @Delete(':id/permissions')
  @Roles(UserRole.ADMIN)
  async revokePermissions(
    @Req() req: UserRequest,
    @Param('id') managerId: string,
    @Body() body: { permissionSlugs: string[] }
  ) {
    const adminProfileId = req.user.profileId;
    return this.adminManagerService.revokePermissions(managerId, adminProfileId, body.permissionSlugs);
  }
}
