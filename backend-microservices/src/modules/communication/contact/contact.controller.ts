import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}
  @Public()
  @Post() async create(@Body() body: any) { return ApiResponse.success(await this.service.createMessage(body), 'Message sent'); }
  @Roles('ADMIN')
  @Get() async get(@Body() body: { status?: string }) { return ApiResponse.success(await this.service.getMessages(body.status)); }
  @Roles('ADMIN')
  @Put(':id/status') async updateStatus(@Param('id') id: string, @Body() body: { status: string }) { return ApiResponse.success(await this.service.updateStatus(id, body.status)); }
}
