import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ length: 255 })
  title: string;

  @Column()
  quantity: number;

  @Column({ name: 'price_per_unit', type: 'numeric', precision: 12, scale: 2 })
  pricePerUnit: number;

  @Column({ name: 'hsn_code', type: 'varchar', length: 10, nullable: true })
  hsnCode: string | null;

  @Column({ name: 'gst_rate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  gstRate: number | null;

  @Column({ name: 'taxable_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxableAmount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  cgst: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  sgst: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  igst: number;

  @Column({ name: 'delivery_charge', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @Column({ name: 'delivery_gst', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryGst: number;

  @Column({ name: 'returned_quantity', default: 0 })
  returnedQuantity: number;

  @Column({ name: 'is_returnable', default: true })
  isReturnable: boolean;

  @Column({ name: 'variant_snapshot', type: 'jsonb', nullable: true })
  variantSnapshot: Record<string, unknown> | null;

  @Column({ name: 'delivery_calculation_snapshot', type: 'jsonb', nullable: true })
  deliveryCalculationSnapshot: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}