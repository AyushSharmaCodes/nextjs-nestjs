import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'productId' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ name: 'sizeLabel', type: 'varchar', length: 50, nullable: true })
  sizeLabel: string | null;

  @Column({ name: 'sizeLabelI18n', type: 'jsonb', default: {} })
  sizeLabelI18n: Record<string, string>;

  @Column({ name: 'sizeValue', type: 'varchar', length: 50, nullable: true })
  sizeValue: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  unit: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'descriptionI18n', type: 'jsonb', default: {} })
  descriptionI18n: Record<string, string>;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  mrp: number | null;

  @Column({ name: 'sellingPrice', type: 'numeric', precision: 12, scale: 2, nullable: true })
  sellingPrice: number | null;

  @Column({ name: 'stockQuantity', default: 0 })
  stockQuantity: number;

  @Column({ name: 'variantImageUrl', type: 'text', nullable: true })
  variantImageUrl: string | null;

  @Column({ name: 'isDefault', default: false })
  isDefault: boolean;

  @Column({ name: 'hsnCode', type: 'varchar', length: 10, nullable: true })
  hsnCode: string | null;

  @Column({ name: 'gstRate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  gstRate: number | null;

  @Column({ name: 'taxApplicable', type: 'boolean', nullable: true })
  taxApplicable: boolean | null;

  @Column({ name: 'priceIncludesTax', type: 'boolean', nullable: true })
  priceIncludesTax: boolean | null;

  @Column({ name: 'razorpayItemId', type: 'varchar', length: 100, nullable: true })
  razorpayItemId: string | null;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}