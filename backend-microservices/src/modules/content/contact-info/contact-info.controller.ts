import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly service: ContactInfoService) {}

  @Get() async getAll(@Query('public') publicOnly = 'true') {
    return ApiResponse.success(await this.service.getAll(publicOnly !== 'false'));
  }

  @Get('key/:key') async getByKey(@Param('key') key: string) {
    return ApiResponse.success(await this.service.getByKey(key));
  }

  @Get('category/:category') async getByCategory(@Param('category') category: string) {
    return ApiResponse.success(await this.service.getByCategory(category));
  }

  @Post() async create(@Body() body: any) {
    return ApiResponse.success(await this.service.create(body), 'Contact info created');
  }

  @Put(':id') async update(@Param('id') id: string, @Body() body: any) {
    return ApiResponse.success(await this.service.update(id, body));
  }

  @Delete(':id') async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.success(null, 'Contact info deleted');
  }
}