import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Category } from '../../category/entities/category.entity';

@Entity({ name: 'products', schema: 'app_product' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'titleI18n', type: 'jsonb', default: {} })
  titleI18n: Record<string, string>;

  @Column({ length: 300, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'descriptionI18n', type: 'jsonb', default: {} })
  descriptionI18n: Record<string, string>;

  @Column({ name: 'sellingPrice', type: 'numeric', precision: 12, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  mrp: number | null;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ name: 'categoryId', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ name: 'variantMode', length: 10, default: 'UNIT' })
  variantMode: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'tagsI18n', type: 'jsonb', default: {} })
  tagsI18n: Record<string, string>;

  @Column({ type: 'jsonb', default: [] })
  benefits: string[];

  @Column({ name: 'benefitsI18n', type: 'jsonb', default: {} })
  benefitsI18n: Record<string, string>;

  @Column({ name: 'isNew', default: false })
  isNew: boolean;

  @Column({ name: 'isReturnable', default: true })
  isReturnable: boolean;

  @Column({ name: 'returnDays', default: 7 })
  returnDays: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'ratingCount', default: 0 })
  ratingCount: number;

  @Column({ name: 'reviewCount', default: 0 })
  reviewCount: number;

  @Column({ name: 'defaultHsnCode', type: 'varchar', length: 10, nullable: true })
  defaultHsnCode: string | null;

  @Column({ name: 'defaultGstRate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  defaultGstRate: number | null;

  @Column({ name: 'defaultTaxApplicable', default: true })
  defaultTaxApplicable: boolean;

  @Column({ name: 'defaultPriceIncludesTax', default: false })
  defaultPriceIncludesTax: boolean;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @Column({ name: 'isFeatured', default: false })
  isFeatured: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}