import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 20 })
  type: string;

  @Column({ name: 'discountPercentage', type: 'numeric', precision: 5, scale: 2, nullable: true })
  discountPercentage: number | null;

  @Column({ name: 'discountAmount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  discountAmount: number | null;

  @Column({ name: 'targetId', type: 'uuid', nullable: true })
  targetId: string | null;

  @Column({ name: 'minPurchaseAmount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  minPurchaseAmount: number;

  @Column({ name: 'maxDiscountAmount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column({ name: 'validFrom', type: 'timestamptz' })
  validFrom: Date;

  @Column({ name: 'validUntil', type: 'timestamptz' })
  validUntil: Date;

  @Column({ name: 'usageLimit', type: 'integer', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'usageCount', default: 0 })
  usageCount: number;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

@Entity('coupon_usage')
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'couponId' })
  couponId: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ name: 'orderId', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'discountAmount', type: 'numeric', precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}