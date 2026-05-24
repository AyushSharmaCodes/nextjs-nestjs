import { Controller, Get, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiResponse } from '../../../common/utils/api-response';

import { EmailTemplate } from './entities/email.entity';

@Controller('email')
export class EmailController {
  constructor(private readonly service: EmailService) {}
  @Post('send') async send(@Body() body: { to: string; subject: string; html: string; text?: string }) { return ApiResponse.success(await this.service.sendEmail(body.to, body.subject, body.html, body.text)); }
  @Post('send-template') async sendTemplate(@Body() body: { to: string; templateKey: string; data: Record<string, string | number | boolean | null> }) { return ApiResponse.success(await this.service.sendTemplatedEmail(body.to, body.templateKey, body.data)); }
  @Post('templates') async createTemplate(@Body() body: Partial<EmailTemplate>) { return ApiResponse.success(await this.service.createTemplate(body), 'Template created'); }
  @Get('templates') async getTemplates() { return ApiResponse.success(await this.service.getTemplates()); }
}