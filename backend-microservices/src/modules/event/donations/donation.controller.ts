import { Controller, Get, Post, Body } from '@nestjs/common';
import { DonationService } from './donation.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('donations')
export class DonationController {
  constructor(private service: DonationService) {}
  @Roles('ADMIN', 'MANAGER')
  @Permissions('donations')
  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('donations')
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Donation recorded'); }
}
