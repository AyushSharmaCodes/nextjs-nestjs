import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 20 })
  type: string;

  @Column({ name: 'discount_percentage', type: 'numeric', precision: 5, scale: 2, nullable: true })
  discountPercentage: number | null;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  discountAmount: number | null;

  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId: string | null;

  @Column({ name: 'min_purchase_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  minPurchaseAmount: number;

  @Column({ name: 'max_discount_amount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column({ name: 'valid_from', type: 'timestamptz' })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamptz' })
  validUntil: Date;

  @Column({ name: 'usage_limit', type: 'integer', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('coupon_usage')
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'coupon_id' })
  couponId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}