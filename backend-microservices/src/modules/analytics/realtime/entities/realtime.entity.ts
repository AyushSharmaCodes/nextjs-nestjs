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
  @Column({ name: 'user_id', type: 'uuid', nullable: true }) userId: string | null;
  @Column({ type: 'jsonb' }) payload: Record<string, any>;
  @Column({ default: false }) isBroadcast: boolean;
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true }) expiresAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('realtime_subscriptions')
export class RealtimeSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'enum', enum: RealtimeChannel }) channel: RealtimeChannel;
  @Column({ name: 'socket_id' }) socketId: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}