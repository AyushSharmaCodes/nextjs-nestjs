import { Controller, Get, Post, Body } from '@nestjs/common';
import { DonationService } from './donation.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('donations')
export class DonationController {
  constructor(private service: DonationService) {}
  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Donation recorded'); }
}