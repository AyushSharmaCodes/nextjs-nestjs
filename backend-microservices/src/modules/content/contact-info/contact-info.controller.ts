import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly service: ContactInfoService) {}

  @Public()
  @Get() async getAll(@Query('public') publicOnly = 'true') {
    return ApiResponse.success(await this.service.getAll(publicOnly !== 'false'));
  }

  @Public()
  @Get('key/:key') async getByKey(@Param('key') key: string) {
    return ApiResponse.success(await this.service.getByKey(key));
  }

  @Public()
  @Get('category/:category') async getByCategory(@Param('category') category: string) {
    return ApiResponse.success(await this.service.getByCategory(category));
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Post() async create(@Body() body: any) { // ts-audit-ignore
    return ApiResponse.success(await this.service.create(body), 'Contact info created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Put(':id') async update(@Param('id') id: string, @Body() body: any) { // ts-audit-ignore
    return ApiResponse.success(await this.service.update(id, body));
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Delete(':id') async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.success(null, 'Contact info deleted');
  }
}
