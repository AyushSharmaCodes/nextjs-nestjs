import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', length: 20, unique: true })
  orderNumber: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 255, nullable: true })
  customerName: string | null;

  @Column({ name: 'customer_email', type: 'varchar', length: 255, nullable: true })
  customerEmail: string | null;

  @Column({ name: 'customer_phone', type: 'varchar', length: 20, nullable: true })
  customerPhone: string | null;

  @Column({ length: 30, default: 'CREATED' })
  status: string;

  @Column({ name: 'payment_status', length: 20, default: 'PENDING' })
  paymentStatus: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 30, nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'delivery_charge', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @Column({ name: 'delivery_gst', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryGst: number;

  @Column({ name: 'coupon_discount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  couponDiscount: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ name: 'shipping_address_id', type: 'uuid', nullable: true })
  shippingAddressId: string | null;

  @Column({ name: 'billing_address_id', type: 'uuid', nullable: true })
  billingAddressId: string | null;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress: Record<string, unknown> | null;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress: Record<string, unknown> | null;

  @Column({ name: 'payment_id', type: 'varchar', length: 100, nullable: true })
  paymentId: string | null;

  @Column({ name: 'invoice_id', type: 'varchar', nullable: true })
  invoiceId: string | null;

  @Column({ name: 'invoice_url', type: 'text', nullable: true })
  invoiceUrl: string | null;

  @Column({ name: 'invoice_status', type: 'varchar', length: 20, nullable: true })
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}