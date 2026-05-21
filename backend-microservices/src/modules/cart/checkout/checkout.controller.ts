import { Controller, Post, Body } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly service: CheckoutService) {}

  @Post('summary') async getSummary(@Body() body: { cart: any }) { return ApiResponse.success(await this.service.calculateSummary(body.cart)); }
  @Post('initiate') async initiate(@Body() body: { cartId: string }, @CurrentUser() user: { id: string }) { return ApiResponse.success(await this.service.initiateCheckout(body.cartId, user.id, body)); }
  @Post('complete') async complete(@Body() body: { checkoutId: string; paymentId: string }) { return ApiResponse.success(await this.service.completeCheckout(body.checkoutId, body.paymentId)); }
}
