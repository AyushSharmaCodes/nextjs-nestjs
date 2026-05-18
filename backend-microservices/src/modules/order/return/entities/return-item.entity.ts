import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'return_id' })
  returnId: string;

  @ManyToOne('Return', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_id' })
  return: any;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @Column()
  quantity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reason: string | null;

  @Column({ length: 20, default: 'PENDING' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('return_qc_results')
export class ReturnQCResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'return_item_id' })
  returnItemId: string;

  @Column({ name: 'inspected_by', type: 'varchar', length: 100, nullable: true })
  inspectedBy: string | null;

  @Column({ length: 50 })
  condition: string;

  @Column({ name: 'is_approved' })
  isApproved: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  photos: string[] | null;

  @CreateDateColumn({ name: 'inspected_at' })
  inspectedAt: Date;
}