import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity({ name: 'orders', schema: 'app_order' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orderNumber', length: 20, unique: true })
  orderNumber: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ name: 'customerName', type: 'varchar', length: 255, nullable: true })
  customerName: string | null;

  @Column({ name: 'customerEmail', type: 'varchar', length: 255, nullable: true })
  customerEmail: string | null;

  @Column({ name: 'customerPhone', type: 'varchar', length: 20, nullable: true })
  customerPhone: string | null;

  @Column({ length: 30, default: 'CREATED' })
  status: string;

  @Column({ name: 'paymentStatus', length: 20, default: 'PENDING' })
  paymentStatus: string;

  @Column({ name: 'paymentMethod', type: 'varchar', length: 30, nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'deliveryCharge', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @Column({ name: 'deliveryGst', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryGst: number;

  @Column({ name: 'couponDiscount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  couponDiscount: number;

  @Column({ name: 'totalAmount', type: 'numeric', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ name: 'shippingAddressId', type: 'uuid', nullable: true })
  shippingAddressId: string | null;

  @Column({ name: 'billingAddressId', type: 'uuid', nullable: true })
  billingAddressId: string | null;

  @Column({ name: 'shippingAddress', type: 'jsonb', nullable: true })
  shippingAddress: Record<string, unknown> | null;

  @Column({ name: 'billingAddress', type: 'jsonb', nullable: true })
  billingAddress: Record<string, unknown> | null;

  @Column({ name: 'paymentId', type: 'varchar', length: 100, nullable: true })
  paymentId: string | null;

  @Column({ name: 'invoiceId', type: 'varchar', nullable: true })
  invoiceId: string | null;

  @Column({ name: 'invoiceUrl', type: 'text', nullable: true })
  invoiceUrl: string | null;

  @Column({ name: 'invoiceStatus', type: 'varchar', length: 20, nullable: true })
  invoiceStatus: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ default: 1 })
  version: number;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory: OrderStatusHistory[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}