import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';

@Entity('delivery_configs')
export class DeliveryConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  scope: string;

  @Column({ name: 'productId', nullable: true })
  productId: string | null;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ name: 'variantId', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  @Column({ name: 'calculationType', length: 20 })
  calculationType: string;

  @Column({ name: 'baseDeliveryCharge', type: 'numeric', precision: 10, scale: 2 })
  baseDeliveryCharge: number;

  @Column({ name: 'maxItemsPerPackage', default: 10 })
  maxItemsPerPackage: number;

  @Column({ name: 'unitWeight', type: 'numeric', precision: 10, scale: 3, nullable: true })
  unitWeight: number | null;

  @Column({ name: 'gstPercentage', type: 'numeric', precision: 5, scale: 2, default: 0 })
  gstPercentage: number;

  @Column({ name: 'isTaxable', default: true })
  isTaxable: boolean;

  @Column({ name: 'deliveryRefundPolicy', type: 'text', nullable: true })
  deliveryRefundPolicy: string | null;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}