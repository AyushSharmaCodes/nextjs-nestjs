import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() action: string;
  @Column({ type: 'jsonb', nullable: true }) metadata: any; // ts-audit-ignore
  @Column({ nullable: true }) ipAddress: string;
  @CreateDateColumn() createdAt: Date;
}