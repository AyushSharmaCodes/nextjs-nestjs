import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orderId' })
  orderId: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ length: 30, default: 'REQUESTED' })
  status: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ name: 'refundAmount', type: 'numeric', precision: 12, scale: 2, nullable: true })
  refundAmount: number | null;

  @Column({ name: 'qcResult', type: 'jsonb', nullable: true })
  qcResult: Record<string, unknown> | null;

  @OneToMany('ReturnItem', 'return')
  items: any[]; // ts-audit-ignore

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}