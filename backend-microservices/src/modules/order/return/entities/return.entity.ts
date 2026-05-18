import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 30, default: 'REQUESTED' })
  status: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ name: 'refund_amount', type: 'numeric', precision: 12, scale: 2, nullable: true })
  refundAmount: number | null;

  @Column({ name: 'qc_result', type: 'jsonb', nullable: true })
  qcResult: Record<string, unknown> | null;

  @OneToMany('ReturnItem', 'return')
  items: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}