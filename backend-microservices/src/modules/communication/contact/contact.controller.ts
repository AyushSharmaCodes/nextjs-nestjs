import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}
  @Post() async create(@Body() body: any) { return ApiResponse.success(await this.service.createMessage(body), 'Message sent'); }
  @Get() async get(@Body() body: { status?: string }) { return ApiResponse.success(await this.service.getMessages(body.status)); }
  @Put(':id/status') async updateStatus(@Param('id') id: string, @Body() body: { status: string }) { return ApiResponse.success(await this.service.updateStatus(id, body.status)); }
}