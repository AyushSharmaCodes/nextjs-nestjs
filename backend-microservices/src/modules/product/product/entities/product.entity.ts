import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'title_i18n', type: 'jsonb', default: {} })
  titleI18n: Record<string, string>;

  @Column({ length: 300, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'description_i18n', type: 'jsonb', default: {} })
  descriptionI18n: Record<string, string>;

  @Column({ name: 'selling_price', type: 'numeric', precision: 12, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  mrp: number | null;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'variant_mode', length: 10, default: 'UNIT' })
  variantMode: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'tags_i18n', type: 'jsonb', default: {} })
  tagsI18n: Record<string, string>;

  @Column({ type: 'jsonb', default: [] })
  benefits: string[];

  @Column({ name: 'benefits_i18n', type: 'jsonb', default: {} })
  benefitsI18n: Record<string, string>;

  @Column({ name: 'is_new', default: false })
  isNew: boolean;

  @Column({ name: 'is_returnable', default: true })
  isReturnable: boolean;

  @Column({ name: 'return_days', default: 7 })
  returnDays: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'default_hsn_code', type: 'varchar', length: 10, nullable: true })
  defaultHsnCode: string | null;

  @Column({ name: 'default_gst_rate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  defaultGstRate: number | null;

  @Column({ name: 'default_tax_applicable', default: true })
  defaultTaxApplicable: boolean;

  @Column({ name: 'default_price_includes_tax', default: false })
  defaultPriceIncludesTax: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}