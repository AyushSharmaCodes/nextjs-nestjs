import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { CouponModule } from './coupon/coupon.module';
import { CheckoutModule } from './checkout/checkout.module';

/**
 * Cart domain module.
 * Consolidates cart, coupon, and checkout sub-modules.
 */
@Module({
  imports: [CartModule, CouponModule, CheckoutModule],
  exports: [CartModule, CouponModule, CheckoutModule],
})
export class CartDomainModule {}
