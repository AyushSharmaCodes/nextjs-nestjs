import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('applied_coupons')
export class AppliedCoupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'coupon_id' })
  couponId: string;

  @Column({ name: 'coupon_code', length: 50 })
  couponCode: string;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn({ name: 'applied_at' })
  appliedAt: Date;
}