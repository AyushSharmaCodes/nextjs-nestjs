import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { WebhookService } from './webhook.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RazorpayWebhookSchema } from './dto/webhook.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Public()
  @Post('razorpay')
  async handle(
    @Body(new ZodValidationPipe(RazorpayWebhookSchema)) payload: any, // ts-audit-ignore
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const result = await this.service.processWebhook(payload, signature);
    return ApiResponse.success(result);
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('webhooks')
  @Get('logs') async logs() { return ApiResponse.success(await this.service.getLogs()); }
}
