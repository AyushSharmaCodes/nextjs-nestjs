import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('store_settings')
export class StoreSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string | null;

  @Column({ name: 'isPublic', default: false })
  isPublic: boolean;

  @Column({ name: 'updatedBy', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

@Entity('system_switches')
export class SystemSwitch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'switchKey', length: 100, unique: true })
  switchKey: string;

  @Column({ name: 'isEnabled', default: true })
  isEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

@Entity('admin_alerts')
export class AdminAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'alertType', length: 50 })
  alertType: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ length: 20, default: 'info' })
  severity: string;

  @Column({ name: 'referenceType', type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ name: 'referenceId', type: 'varchar', nullable: true })
  referenceId: string | null;

  @Column({ name: 'isRead', default: false })
  isRead: boolean;

  @Column({ name: 'readBy', type: 'uuid', nullable: true })
  readBy: string | null;

  @Column({ name: 'readAt', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}

@Entity('admin_notifications')
export class AdminNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string | null;

  @Column({ name: 'referenceUrl', type: 'text', nullable: true })
  referenceUrl: string | null;

  @Column({ name: 'isRead', default: false })
  isRead: boolean;

  @Column({ name: 'isArchived', default: false })
  isArchived: boolean;

  @Column({ name: 'readAt', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}