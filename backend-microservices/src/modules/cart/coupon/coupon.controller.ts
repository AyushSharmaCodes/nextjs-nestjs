import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { CouponService } from './coupon.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateCouponDto, UpdateCouponDto, CreateCouponSchema, UpdateCouponSchema } from './dto/coupon.dto';

@Controller('coupons')
export class CouponController {
  constructor(private readonly service: CouponService) {}

  @Get() async getCoupons() { return ApiResponse.success(await this.service.getCoupons()); }
  @Get(':id') async getCoupon(@Param('id') id: string) { return ApiResponse.success(await this.service.getCoupon(id)); }
  @Post() async create(@Body(new ZodValidationPipe(CreateCouponSchema)) body: CreateCouponDto) { return ApiResponse.success(await this.service.createCoupon(body), 'Coupon created'); }
  @Put(':id') async update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateCouponSchema)) body: UpdateCouponDto) { return ApiResponse.success(await this.service.updateCoupon(id, body), 'Coupon updated'); }
  @Delete(':id') async delete(@Param('id') id: string) { await this.service.deleteCoupon(id); return ApiResponse.success(null, 'Coupon deleted'); }
  @Post('validate') async validate(@Body(new ZodValidationPipe(z.object({ code: z.string().min(1), userId: z.string().uuid(), cartTotal: z.number().nonnegative() }))) body: { code: string; userId: string; cartTotal: number }) { return ApiResponse.success(await this.service.validateCoupon(body.code, body.userId, body.cartTotal)); }
}