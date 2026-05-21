import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cartId' })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column({ name: 'productId' })
  productId: string;

  @Column({ name: 'variantId', type: 'uuid', nullable: true })
  variantId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ name: 'imageUrl', type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'pricePerUnit', type: 'numeric', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  mrp: number | null;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'variantLabel', type: 'varchar', nullable: true })
  variantLabel: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}