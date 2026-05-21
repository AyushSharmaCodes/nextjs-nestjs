import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Public()
  @Get('public') async getPublic() { return ApiResponse.success(await this.service.getPublicSettings()); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Get() async getAll() { return ApiResponse.success(await this.service.getAllSettings()); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Put() async update(@Body() body: { key: string; value: any; category?: string }) { return ApiResponse.success(await this.service.updateSetting(body.key, body.value, body.category), 'Setting updated'); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Get(':key') async get(@Param('key') key: string) { return ApiResponse.success(await this.service.getSetting(key)); }
}
