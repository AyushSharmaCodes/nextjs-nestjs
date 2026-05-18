import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';

@Entity('delivery_configs')
export class DeliveryConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  scope: string;

  @Column({ name: 'product_id', nullable: true })
  productId: string | null;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ name: 'calculation_type', length: 20 })
  calculationType: string;

  @Column({ name: 'base_delivery_charge', type: 'numeric', precision: 10, scale: 2 })
  baseDeliveryCharge: number;

  @Column({ name: 'max_items_per_package', default: 10 })
  maxItemsPerPackage: number;

  @Column({ name: 'unit_weight', type: 'numeric', precision: 10, scale: 3, nullable: true })
  unitWeight: number | null;

  @Column({ name: 'gst_percentage', type: 'numeric', precision: 5, scale: 2, default: 0 })
  gstPercentage: number;

  @Column({ name: 'is_taxable', default: true })
  isTaxable: boolean;

  @Column({ name: 'delivery_refund_policy', type: 'text', nullable: true })
  deliveryRefundPolicy: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}