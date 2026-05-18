import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ name: 'size_label', type: 'varchar', length: 50, nullable: true })
  sizeLabel: string | null;

  @Column({ name: 'size_label_i18n', type: 'jsonb', default: {} })
  sizeLabelI18n: Record<string, string>;

  @Column({ name: 'size_value', type: 'varchar', length: 50, nullable: true })
  sizeValue: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  unit: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'description_i18n', type: 'jsonb', default: {} })
  descriptionI18n: Record<string, string>;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  mrp: number | null;

  @Column({ name: 'selling_price', type: 'numeric', precision: 12, scale: 2, nullable: true })
  sellingPrice: number | null;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ name: 'variant_image_url', type: 'text', nullable: true })
  variantImageUrl: string | null;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'hsn_code', type: 'varchar', length: 10, nullable: true })
  hsnCode: string | null;

  @Column({ name: 'gst_rate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  gstRate: number | null;

  @Column({ name: 'tax_applicable', type: 'boolean', nullable: true })
  taxApplicable: boolean | null;

  @Column({ name: 'price_includes_tax', type: 'boolean', nullable: true })
  priceIncludesTax: boolean | null;

  @Column({ name: 'razorpay_item_id', type: 'varchar', length: 100, nullable: true })
  razorpayItemId: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}