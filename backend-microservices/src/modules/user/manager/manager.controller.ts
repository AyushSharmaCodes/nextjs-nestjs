import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Roles('ADMIN', 'MANAGER')
@Permissions('managers')
@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get() async getManagers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return ApiResponse.success(await this.managerService.getManagers({ page, limit, role, search }));
  }

  @Get('me') async getCurrentManager(@CurrentUser() user: { id: string }) {
    return ApiResponse.success(await this.managerService.getManagerByIdentityId(user.id));
  }

  @Get(':id') async getManager(@Param('id') id: string) { 
    return ApiResponse.success(await this.managerService.getManager(id)); 
  }

  @Post() async createManager(@Body() body: { identityId: string; name: string; phone?: string; role?: string }) {
    return ApiResponse.success(await this.managerService.createManager(body), 'Manager created');
  }

  @Put(':id') async updateManager(@Param('id') id: string, @Body() body: { name?: string; phone?: string; role?: string }) {
    return ApiResponse.success(await this.managerService.updateManager(id, body), 'Manager updated');
  }

  @Delete(':id') async deleteManager(@Param('id') id: string) {
    await this.managerService.deleteManager(id);
    return ApiResponse.success(null, 'Manager deleted');
  }

  @Put(':id/activate') async activateManager(@Param('id') id: string) {
    return ApiResponse.success(await this.managerService.activateManager(id), 'Manager activated');
  }

  @Put(':id/deactivate') async deactivateManager(@Param('id') id: string) {
    return ApiResponse.success(await this.managerService.deactivateManager(id), 'Manager deactivated');
  }

  @Get(':id/permissions') async getPermissions(@Param('id') id: string) { 
    return ApiResponse.success(await this.managerService.getPermissions(id)); 
  }

  @Put(':id/permissions') async updatePermissions(@Param('id') id: string, @Body() body: any) { 
    return ApiResponse.success(await this.managerService.updatePermissions(id, body), 'Permissions updated'); 
  }

  @Post('check-permission') async checkPermission(@CurrentUser() user: { id: string }, @Body() body: { permission: string }) {
    const hasPermission = await this.managerService.hasPermission(user.id, body.permission);
    return ApiResponse.success({ hasPermission });
  }
}
