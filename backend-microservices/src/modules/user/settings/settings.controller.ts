import { Controller, Get, Put, Body, Param, Headers } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('public') async getPublic() { return ApiResponse.success(await this.service.getPublicSettings()); }
  @Get() async getAll(@Headers('x-permission') permission?: string) { return ApiResponse.success(await this.service.getAllSettings()); }
  @Put() async update(@Body() body: { key: string; value: any; category?: string }) { return ApiResponse.success(await this.service.updateSetting(body.key, body.value, body.category), 'Setting updated'); }
  @Get(':key') async get(@Param('key') key: string) { return ApiResponse.success(await this.service.getSetting(key)); }
}