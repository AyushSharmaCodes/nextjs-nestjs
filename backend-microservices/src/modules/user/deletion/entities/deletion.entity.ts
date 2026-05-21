import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('account_deletion_jobs')
export class AccountDeletionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identityId' })
  identityId: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ length: 30, default: 'PENDING' })
  status: string;

  @Column({ name: 'requestedAt', type: 'timestamptz', default: () => 'now()' })
  requestedAt: Date;

  @Column({ name: 'scheduledFor', type: 'timestamptz', nullable: true })
  scheduledFor: Date | null;

  @Column({ name: 'otpVerified', default: false })
  otpVerified: boolean;

  @Column({ name: 'deletionAuthorizationTokenHash', type: 'varchar', length: 128, nullable: true })
  deletionAuthTokenHash: string | null;

  @Column({ name: 'datExpiresAt', type: 'timestamptz', nullable: true })
  datExpiresAt: Date | null;

  @Column({ name: 'completedAt', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'errorMessage', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'retryCount', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

@Entity('account_deletion_audit')
export class AccountDeletionAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deletionJobId', type: 'uuid', nullable: true })
  deletionJobId: string | null;

  @Column({ name: 'identityId' })
  identityId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  actor: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}