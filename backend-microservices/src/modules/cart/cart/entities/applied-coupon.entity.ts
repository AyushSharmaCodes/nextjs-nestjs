import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('applied_coupons')
export class AppliedCoupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cartId' })
  cartId: string;

  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column({ name: 'couponId' })
  couponId: string;

  @Column({ name: 'couponCode', length: 50 })
  couponCode: string;

  @Column({ name: 'discountAmount', type: 'numeric', precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn({ name: 'appliedAt' })
  appliedAt: Date;
}