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
@Entity('cron_jobs')
export class CronJob {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) jobId: string;

  @Column({ type: 'enum', enum: JobType }) type: JobType;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING }) status: JobStatus;

  @Column({ type: 'enum', enum: JobPriority, default: JobPriority.NORMAL }) priority: JobPriority;

  @Column() name: string;

  @Column({ type: 'text', nullable: true }) description: string | null;

  @Column({ type: 'jsonb', nullable: true }) payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true }) result: Record<string, any>;

  @Column({ type: 'text', nullable: true }) error: string | null;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true }) scheduledAt: Date | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true }) startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true }) completedAt: Date | null;

  @Column({ name: 'retry_count', default: 0 }) retryCount: number;

  @Column({ name: 'max_retries', default: 3 }) maxRetries: number;

  @Column({ name: 'timeout_seconds', type: 'integer', nullable: true }) timeoutSeconds: number | null;

  @Column({ name: 'cron_expression', type: 'varchar', nullable: true }) cronExpression: string | null;

  @Column({ name: 'is_recurring', default: false }) isRecurring: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true }) createdBy: string | null;

  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true }) lastRunAt: Date | null;

  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true }) nextRunAt: Date | null;

  @Column({ name: 'is_active', default: true }) isActive: boolean;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Index(['status', 'createdAt'])
@Entity('job_runs')
export class JobRun {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'job_id' }) jobId: string;

  @Column({ name: 'cron_job_id', type: 'uuid', nullable: true }) cronJobId: string | null;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING }) status: JobStatus;

  @Column({ type: 'jsonb', nullable: true }) payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true }) result: Record<string, any>;

  @Column({ type: 'text', nullable: true }) error: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true }) startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true }) completedAt: Date | null;

  @Column({ name: 'retry_count', default: 0 }) retryCount: number;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}