import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AlertType {
  ORDER = 'order',
  PRODUCT = 'product',
  USER = 'user',
  PAYMENT = 'payment',
  SYSTEM = 'system',
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  UNREAD = 'unread',
  READ = 'read',
  RESOLVED = 'resolved',
}

@Entity('admin_alerts')
export class AdminAlert {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'enum', enum: AlertType }) type: AlertType;
  @Column({ type: 'enum', enum: AlertPriority }) priority: AlertPriority;
  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.UNREAD }) status: AlertStatus;
  @Column() title: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, any>;
  @Column({ name: 'created_by', type: 'uuid', nullable: true }) createdBy: string | null;
  @Column({ name: 'resolved_by', type: 'uuid', nullable: true }) resolvedBy: string | null;
  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true }) resolvedAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}