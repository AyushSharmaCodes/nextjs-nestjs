import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('bank-details')
export class BankDetailsController {
  constructor(private readonly service: BankDetailsService) {}

  @Public()
  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Public()
  @Get('default') getDefault() { return ApiResponse.success(this.service.getDefault()); }
  @Public()
  @Get(':id') getById(@Param('id') id: string) { return ApiResponse.success(this.service.getById(id)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Post() create(@Body() body: any) { return ApiResponse.success(this.service.create(body), 'Bank details created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.update(id, body)); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Put(':id/set-default') setDefault(@Param('id') id: string) { return ApiResponse.success(this.service.setDefault(id), 'Default set'); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('settings')
  @Delete(':id') delete(@Param('id') id: string) { return ApiResponse.success(this.service.delete(id), 'Bank details deleted'); }
}
