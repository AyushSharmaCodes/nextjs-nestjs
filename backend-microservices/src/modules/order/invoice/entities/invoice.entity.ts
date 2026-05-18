import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', unique: true })
  orderId: string;

  @ManyToOne('Order')
  @JoinColumn({ name: 'order_id' })
  order: any;

  @Column({ name: 'invoice_number', length: 30, unique: true })
  invoiceNumber: string;

  @Column({ name: 'invoice_url', type: 'text', nullable: true })
  invoiceUrl: string | null;

  @Column({ name: 'storage_path', type: 'text', nullable: true })
  storagePath: string | null;

  @Column({ name: 'file_type', length: 20, default: 'pdf' })
  fileType: string;

  @Column({ name: 'generated_at', type: 'timestamptz', nullable: true })
  generatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}