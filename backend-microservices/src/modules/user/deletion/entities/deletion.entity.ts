import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('account_deletion_jobs')
export class AccountDeletionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identity_id' })
  identityId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 30, default: 'PENDING' })
  status: string;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'now()' })
  requestedAt: Date;

  @Column({ name: 'scheduled_for', type: 'timestamptz', nullable: true })
  scheduledFor: Date | null;

  @Column({ name: 'otp_verified', default: false })
  otpVerified: boolean;

  @Column({ name: 'deletion_authorization_token_hash', type: 'varchar', length: 128, nullable: true })
  deletionAuthTokenHash: string | null;

  @Column({ name: 'dat_expires_at', type: 'timestamptz', nullable: true })
  datExpiresAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('account_deletion_audit')
export class AccountDeletionAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deletion_job_id', type: 'uuid', nullable: true })
  deletionJobId: string | null;

  @Column({ name: 'identity_id' })
  identityId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  actor: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}