import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RealtimeEventType {
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  INVENTORY_LOW = 'inventory.low',
  USER_REGISTERED = 'user.registered',
}

export enum RealtimeChannel {
  ADMIN = 'admin',
  USER = 'user',
  ORDER = 'order',
  PAYMENT = 'payment',
}

@Entity('realtime_events')
export class RealtimeEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'enum', enum: RealtimeEventType }) event: RealtimeEventType;
  @Column({ type: 'enum', enum: RealtimeChannel }) channel: RealtimeChannel;
  @Column({ name: 'userId', type: 'uuid', nullable: true }) userId: string | null;
  @Column({ type: 'jsonb' }) payload: Record<string, any>;
  @Column({ default: false }) isBroadcast: boolean;
  @Column({ name: 'expiresAt', type: 'timestamptz', nullable: true }) expiresAt: Date | null;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}

@Entity('realtime_subscriptions')
export class RealtimeSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'enum', enum: RealtimeChannel }) channel: RealtimeChannel;
  @Column({ name: 'socketId' }) socketId: string;
  @Column({ name: 'isActive', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}