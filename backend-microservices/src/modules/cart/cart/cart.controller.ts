import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { AddCartItemDto, UpdateCartItemDto, ApplyCouponDto } from './dto/cart.dto';

const BodyPipe = new ZodValidationPipe();

@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get() async getCart(@CurrentUser() user: { id: string }, @Headers('x-session-id') sessionId?: string) { return ApiResponse.success(await this.service.getCart(user.id, sessionId)); }
  @Post('items') async addItem(@CurrentUser() user: { id: string }, @Headers('x-session-id') sessionId: string, @Body(new ZodValidationPipe(AddCartItemDto)) body: AddCartItemDto) { return ApiResponse.success(await this.service.addItem(user.id, sessionId, body), 'Item added'); }
  @Put('items/:itemId') async updateQuantity(@CurrentUser() user: { id: string }, @Headers('x-session-id') sessionId: string, @Param('itemId') itemId: string, @Body(new ZodValidationPipe(UpdateCartItemDto)) body: UpdateCartItemDto) { return ApiResponse.success(await this.service.updateQuantity(user.id, sessionId, itemId, body.quantity)); }
  @Delete('items/:itemId') async removeItem(@CurrentUser() user: { id: string }, @Headers('x-session-id') sessionId: string, @Param('itemId') itemId: string) { return ApiResponse.success(await this.service.removeItem(user.id, sessionId, itemId), 'Item removed'); }
  @Delete() async clearCart(@CurrentUser() user: { id: string }, @Headers('x-session-id') sessionId: string) { return ApiResponse.success(await this.service.clearCart(user.id, sessionId), 'Cart cleared'); }
  @Post('coupon') async applyCoupon(@CurrentUser() user: { id: string }, @Headers('x-session-id') sessionId: string, @Body(new ZodValidationPipe(ApplyCouponDto)) body: ApplyCouponDto) { return ApiResponse.success(await this.service.applyCoupon(user.id, sessionId, body.couponId, body.code, body.discountAmount), 'Coupon applied'); }
  @Delete('coupon') async removeCoupon(@CurrentUser() user: { id: string }, @Headers('x-session-id') sessionId: string) { return ApiResponse.success(await this.service.removeCoupon(user.id, sessionId), 'Coupon removed'); }
  @Post('merge') async mergeCart(@Headers('x-session-id') guestSessionId: string, @CurrentUser() user: { id: string }) { return ApiResponse.success(await this.service.mergeCart(guestSessionId, user.id), 'Cart merged'); }
}
