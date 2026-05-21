import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('payment_intents')
export class PaymentIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ name: 'orderId', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'razorpayOrderId', type: 'varchar', length: 100, unique: true, nullable: true })
  razorpayOrderId: string | null;

  @Column({ name: 'razorpayPaymentId', type: 'varchar', length: 100, unique: true, nullable: true })
  razorpayPaymentId: string | null;

  @Column({ name: 'razorpaySignature', type: 'varchar', length: 255, nullable: true })
  razorpaySignature: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ length: 30, default: 'CREATED' })
  status: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  method: string | null;

  @Column({ name: 'checkoutId', type: 'uuid', nullable: true })
  checkoutId: string | null;

  @Column({ name: 'isInternational', default: false })
  isInternational: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notes: Record<string, unknown> | null;

  @Column({ name: 'errorCode', type: 'varchar', length: 50, nullable: true })
  errorCode: string | null;

  @Column({ name: 'errorDescription', type: 'text', nullable: true })
  errorDescription: string | null;

  @Column({ name: 'capturedAt', type: 'timestamptz', nullable: true })
  capturedAt: Date | null;

  @Column({ name: 'expiresAt', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}

@Entity('refunds')
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'paymentIntentId' })
  paymentIntentId: string;

  @Column({ name: 'razorpayRefundId', type: 'varchar', length: 100, unique: true, nullable: true })
  razorpayRefundId: string | null;

  @Column({ name: 'refundAmount', type: 'numeric', precision: 12, scale: 2 })
  refundAmount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @Column({ length: 30, default: 'CREATED' })
  status: string;

  @Column({ length: 20, default: 'FULL' })
  type: string;

  @Column({ name: 'returnId', type: 'uuid', nullable: true })
  returnId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  notes: Record<string, unknown> | null;

  @Column({ name: 'processedAt', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'eventType', length: 100 })
  eventType: string;

  @Column({ name: 'razorpayEventId', length: 100, unique: true })
  razorpayEventId: string;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ name: 'processed', default: false })
  processed: boolean;

  @Column({ name: 'processingError', type: 'text', nullable: true })
  processingError: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}