import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orderId', unique: true })
  orderId: string;

  @ManyToOne('Order')
  @JoinColumn({ name: 'orderId' })
  order: any; // ts-audit-ignore

  @Column({ name: 'invoiceNumber', length: 30, unique: true })
  invoiceNumber: string;

  @Column({ name: 'invoiceUrl', type: 'text', nullable: true })
  invoiceUrl: string | null;

  @Column({ name: 'storagePath', type: 'text', nullable: true })
  storagePath: string | null;

  @Column({ name: 'fileType', length: 20, default: 'pdf' })
  fileType: string;

  @Column({ name: 'generatedAt', type: 'timestamptz', nullable: true })
  generatedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}