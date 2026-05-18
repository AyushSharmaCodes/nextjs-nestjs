import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('bank-details')
export class BankDetailsController {
  constructor(private readonly service: BankDetailsService) {}

  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Get('default') getDefault() { return ApiResponse.success(this.service.getDefault()); }
  @Get(':id') getById(@Param('id') id: string) { return ApiResponse.success(this.service.getById(id)); }
  @Post() create(@Body() body: any) { return ApiResponse.success(this.service.create(body), 'Bank details created'); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.update(id, body)); }
  @Put(':id/set-default') setDefault(@Param('id') id: string) { return ApiResponse.success(this.service.setDefault(id), 'Default set'); }
  @Delete(':id') delete(@Param('id') id: string) { return ApiResponse.success(this.service.delete(id), 'Bank details deleted'); }
}