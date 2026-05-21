import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'productId' }) productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column() sku: string;

  @Column({ type: 'jsonb', nullable: true }) attributes: Record<string, string>;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) mrp: number;

  @Column({ default: 0 }) stock: number;

  @Column({ name: 'lowStockThreshold', default: 10 }) lowStockThreshold: number;

  @Column({ name: 'imageUrl', type: 'varchar', nullable: true }) imageUrl: string | null;

  @Column({ nullable: true }) weight: number;

  @Column({ default: true }) isActive: boolean;

  @Column({ default: false }) isDefault: boolean;

  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('variant_options')
export class VariantOption {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'productId' }) productId: string;

  @Column() name: string;

  @Column() value: string;

  @Column({ default: true }) isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}