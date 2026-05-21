import { Controller, Get, Post, Body } from '@nestjs/common';
import { FaqService } from './faq.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('faqs')
export class FaqController {
  constructor(private service: FaqService) {}
  @Public()
  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('faqs')
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); }
}
