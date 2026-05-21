import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'returnId' })
  returnId: string;

  @ManyToOne('Return', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'returnId' })
  return: any;

  @Column({ name: 'orderItemId' })
  orderItemId: string;

  @Column()
  quantity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reason: string | null;

  @Column({ length: 20, default: 'PENDING' })
  status: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}

@Entity('return_qc_results')
export class ReturnQCResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'returnItemId' })
  returnItemId: string;

  @Column({ name: 'inspectedBy', type: 'varchar', length: 100, nullable: true })
  inspectedBy: string | null;

  @Column({ length: 50 })
  condition: string;

  @Column({ name: 'isApproved' })
  isApproved: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  photos: string[] | null;

  @CreateDateColumn({ name: 'inspectedAt' })
  inspectedAt: Date;
}