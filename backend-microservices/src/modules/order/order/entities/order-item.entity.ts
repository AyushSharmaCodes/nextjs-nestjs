import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orderId' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ name: 'productId' })
  productId: string;

  @Column({ name: 'variantId', type: 'uuid', nullable: true })
  variantId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ length: 255 })
  title: string;

  @Column()
  quantity: number;

  @Column({ name: 'pricePerUnit', type: 'numeric', precision: 12, scale: 2 })
  pricePerUnit: number;

  @Column({ name: 'hsnCode', type: 'varchar', length: 10, nullable: true })
  hsnCode: string | null;

  @Column({ name: 'gstRate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  gstRate: number | null;

  @Column({ name: 'taxableAmount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxableAmount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  cgst: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  sgst: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  igst: number;

  @Column({ name: 'deliveryCharge', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @Column({ name: 'deliveryGst', type: 'numeric', precision: 10, scale: 2, default: 0 })
  deliveryGst: number;

  @Column({ name: 'returnedQuantity', default: 0 })
  returnedQuantity: number;

  @Column({ name: 'isReturnable', default: true })
  isReturnable: boolean;

  @Column({ name: 'variantSnapshot', type: 'jsonb', nullable: true })
  variantSnapshot: Record<string, unknown> | null;

  @Column({ name: 'deliveryCalculationSnapshot', type: 'jsonb', nullable: true })
  deliveryCalculationSnapshot: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}