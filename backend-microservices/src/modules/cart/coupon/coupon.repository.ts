import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponUsage } from './entities/coupon.entity';

@Injectable()
export class CouponRepository {
  constructor(
    @InjectRepository(Coupon) private couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage) private usageRepo: Repository<CouponUsage>,
  ) {}

  async findByCode(code: string) { return this.couponRepo.findOne({ where: { code: code.toUpperCase() } }); }
  async findAll() { return this.couponRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } }); }
  async findById(id: string) { return this.couponRepo.findOne({ where: { id } }); }
  async create(data: Partial<Coupon>) { return this.couponRepo.save(this.couponRepo.create(data)); }
  async update(id: string, data: Partial<Coupon>) { await this.couponRepo.update(id, data); return this.couponRepo.findOne({ where: { id } }); }
  async delete(id: string) { await this.couponRepo.update(id, { isActive: false }); }

  async validate(code: string, userId: string, cartTotal: number) {
    const coupon = await this.findByCode(code);
    if (!coupon) throw new BadRequestException('Invalid coupon');
    if (!coupon.isActive) throw new BadRequestException('Coupon is not active');
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) throw new BadRequestException('Coupon is not valid');
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');
    if (cartTotal < coupon.minPurchaseAmount) throw new BadRequestException(`Minimum purchase of ₹${coupon.minPurchaseAmount} required`);

    let discount = 0;
    if (coupon.discountPercentage) {
      discount = cartTotal * (coupon.discountPercentage / 100);
    } else if (coupon.discountAmount) {
      discount = coupon.discountAmount;
    }
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
    return { valid: true, discount, coupon };
  }

  async recordUsage(couponId: string, userId: string, orderId: string, discountAmount: number) {
    await this.couponRepo.increment({ id: couponId }, 'usageCount', 1);
    const usage = this.usageRepo.create({ couponId, userId, orderId, discountAmount });
    await this.usageRepo.save(usage);
  }
}