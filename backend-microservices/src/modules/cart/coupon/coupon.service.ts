import { Injectable } from '@nestjs/common';
import { CouponRepository } from './coupon.repository';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly repo: CouponRepository) {}

  async getCoupons() { return this.repo.findAll(); }
  async getCoupon(id: string) { return this.repo.findById(id); }
  async createCoupon(data: CreateCouponDto) { return this.repo.create({ ...data, code: data.code.toUpperCase() }); }
  async updateCoupon(id: string, data: UpdateCouponDto) { return this.repo.update(id, data); }
  async deleteCoupon(id: string) { return this.repo.delete(id); }
  async validateCoupon(code: string, userId: string, cartTotal: number) { return this.repo.validate(code, userId, cartTotal); }
  async recordUsage(couponId: string, userId: string, orderId: string, discountAmount: number) { return this.repo.recordUsage(couponId, userId, orderId, discountAmount); }
}