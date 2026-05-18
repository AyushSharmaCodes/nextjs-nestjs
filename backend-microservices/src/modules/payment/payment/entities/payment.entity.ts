import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('payment_intents')
export class PaymentIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'razorpay_order_id', type: 'varchar', length: 100, unique: true, nullable: true })
  razorpayOrderId: string | null;

  @Column({ name: 'razorpay_payment_id', type: 'varchar', length: 100, unique: true, nullable: true })
  razorpayPaymentId: string | null;

  @Column({ name: 'razorpay_signature', type: 'varchar', length: 255, nullable: true })
  razorpaySignature: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ length: 30, default: 'CREATED' })
  status: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  method: string | null;

  @Column({ name: 'checkout_id', type: 'uuid', nullable: true })
  checkoutId: string | null;

  @Column({ name: 'is_international', default: false })
  isInternational: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notes: Record<string, unknown> | null;

  @Column({ name: 'error_code', type: 'varchar', length: 50, nullable: true })
  errorCode: string | null;

  @Column({ name: 'error_description', type: 'text', nullable: true })
  errorDescription: string | null;

  @Column({ name: 'captured_at', type: 'timestamptz', nullable: true })
  capturedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('refunds')
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_intent_id' })
  paymentIntentId: string;

  @Column({ name: 'razorpay_refund_id', type: 'varchar', length: 100, unique: true, nullable: true })
  razorpayRefundId: string | null;

  @Column({ name: 'refund_amount', type: 'numeric', precision: 12, scale: 2 })
  refundAmount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @Column({ length: 30, default: 'CREATED' })
  status: string;

  @Column({ length: 20, default: 'FULL' })
  type: string;

  @Column({ name: 'return_id', type: 'uuid', nullable: true })
  returnId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  notes: Record<string, unknown> | null;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column({ name: 'razorpay_event_id', length: 100, unique: true })
  razorpayEventId: string;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ name: 'processed', default: false })
  processed: boolean;

  @Column({ name: 'processing_error', type: 'text', nullable: true })
  processingError: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}