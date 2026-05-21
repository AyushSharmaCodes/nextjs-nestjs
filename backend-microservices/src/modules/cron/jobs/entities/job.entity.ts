import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum JobType {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  EXPORT = 'export',
  IMPORT = 'import',
  CLEANUP = 'cleanup',
  SYNC = 'sync',
  REPORT = 'report',
  ORDER_STATUS_CHECK = 'order_status_check',
  PAYMENT_VERIFICATION = 'payment_verification',
  INVENTORY_UPDATE = 'inventory_update',
  NOTIFICATION = 'notification',
  EXPIRY_CHECK = 'expiry_check',
}

@Index(['status', 'scheduledAt'])
@Entity({ name: 'cronJobs', schema: 'cron' })
export class CronJob {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'jobId', unique: true }) jobId: string;

  @Column({ type: 'enum', enum: JobType }) type: JobType;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING }) status: JobStatus;

  @Column({ type: 'enum', enum: JobPriority, default: JobPriority.NORMAL }) priority: JobPriority;

  @Column() name: string;

  @Column({ type: 'text', nullable: true }) description: string | null;

  @Column({ type: 'jsonb', nullable: true }) payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true }) result: Record<string, any>;

  @Column({ type: 'text', nullable: true }) error: string | null;

  @Column({ name: 'scheduledAt', type: 'timestamptz', nullable: true }) scheduledAt: Date | null;

  @Column({ name: 'startedAt', type: 'timestamptz', nullable: true }) startedAt: Date | null;

  @Column({ name: 'completedAt', type: 'timestamptz', nullable: true }) completedAt: Date | null;

  @Column({ name: 'retryCount', default: 0 }) retryCount: number;

  @Column({ name: 'maxRetries', default: 3 }) maxRetries: number;

  @Column({ name: 'timeoutSeconds', type: 'integer', nullable: true }) timeoutSeconds: number | null;

  @Column({ name: 'cronExpression', type: 'varchar', nullable: true }) cronExpression: string | null;

  @Column({ name: 'isRecurring', default: false }) isRecurring: boolean;

  @Column({ name: 'createdBy', type: 'uuid', nullable: true }) createdBy: string | null;

  @Column({ name: 'lastRunAt', type: 'timestamptz', nullable: true }) lastRunAt: Date | null;

  @Column({ name: 'nextRunAt', type: 'timestamptz', nullable: true }) nextRunAt: Date | null;

  @Column({ name: 'isActive', default: true }) isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Index(['status', 'createdAt'])
@Entity({ name: 'jobRuns', schema: 'cron' })
export class JobRun {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'jobId' }) jobId: string;

  @Column({ name: 'cronJobId', type: 'uuid', nullable: true }) cronJobId: string | null;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING }) status: JobStatus;

  @Column({ type: 'jsonb', nullable: true }) payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true }) result: Record<string, any>;

  @Column({ type: 'text', nullable: true }) error: string | null;

  @Column({ name: 'startedAt', type: 'timestamptz', nullable: true }) startedAt: Date | null;

  @Column({ name: 'completedAt', type: 'timestamptz', nullable: true }) completedAt: Date | null;

  @Column({ name: 'retryCount', default: 0 }) retryCount: number;

  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}