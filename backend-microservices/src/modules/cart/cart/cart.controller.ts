import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { CartService } from './cart.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { AddCartItemDto, UpdateCartItemDto, ApplyCouponDto } from './dto/cart.dto';

const BodyPipe = new ZodValidationPipe();

@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get() async getCart(@Headers('x-user-id') userId?: string, @Headers('x-session-id') sessionId?: string) { return ApiResponse.success(await this.service.getCart(userId, sessionId)); }
  @Post('items') async addItem(@Headers('x-user-id') userId: string, @Headers('x-session-id') sessionId: string, @Body(new ZodValidationPipe(AddCartItemDto)) body: AddCartItemDto) { return ApiResponse.success(await this.service.addItem(userId, sessionId, body), 'Item added'); }
  @Put('items/:itemId') async updateQuantity(@Headers('x-user-id') userId: string, @Headers('x-session-id') sessionId: string, @Param('itemId') itemId: string, @Body(new ZodValidationPipe(UpdateCartItemDto)) body: UpdateCartItemDto) { return ApiResponse.success(await this.service.updateQuantity(userId, sessionId, itemId, body.quantity)); }
  @Delete('items/:itemId') async removeItem(@Headers('x-user-id') userId: string, @Headers('x-session-id') sessionId: string, @Param('itemId') itemId: string) { return ApiResponse.success(await this.service.removeItem(userId, sessionId, itemId), 'Item removed'); }
  @Delete() async clearCart(@Headers('x-user-id') userId: string, @Headers('x-session-id') sessionId: string) { return ApiResponse.success(await this.service.clearCart(userId, sessionId), 'Cart cleared'); }
  @Post('coupon') async applyCoupon(@Headers('x-user-id') userId: string, @Headers('x-session-id') sessionId: string, @Body(new ZodValidationPipe(ApplyCouponDto)) body: ApplyCouponDto) { return ApiResponse.success(await this.service.applyCoupon(userId, sessionId, body.couponId, body.code, body.discountAmount), 'Coupon applied'); }
  @Delete('coupon') async removeCoupon(@Headers('x-user-id') userId: string, @Headers('x-session-id') sessionId: string) { return ApiResponse.success(await this.service.removeCoupon(userId, sessionId), 'Coupon removed'); }
  @Post('merge') async mergeCart(@Headers('x-session-id') guestSessionId: string, @Headers('x-user-id') userId: string) { return ApiResponse.success(await this.service.mergeCart(guestSessionId, userId), 'Cart merged'); }
}