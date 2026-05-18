import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { WebhookService } from './webhook.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RazorpayWebhookSchema } from './dto/webhook.dto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Post('razorpay')
  async handle(
    @Body(new ZodValidationPipe(RazorpayWebhookSchema)) payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const result = await this.service.processWebhook(payload, signature);
    return ApiResponse.success(result);
  }

  @Get('logs') async logs() { return ApiResponse.success(await this.service.getLogs()); }
}