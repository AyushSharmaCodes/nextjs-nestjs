import { Controller, Get, Post, Body } from '@nestjs/common';
import { FaqService } from './faq.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('faqs')
export class FaqController {
  constructor(private service: FaqService) {}
  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); }
}