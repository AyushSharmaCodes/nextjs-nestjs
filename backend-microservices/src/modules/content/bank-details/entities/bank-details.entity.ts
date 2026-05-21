import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bank_details')
export class BankDetail {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() bankName: string;
  @Column({ name: 'accountNumber' }) accountNumber: string;
  @Column({ name: 'ifscCode', length: 20 }) ifscCode: string;
  @Column({ name: 'branchName', type: 'varchar', nullable: true }) branchName: string | null;
  @Column({ default: 'current' }) accountType: string;
  @Column({ type: 'varchar', nullable: true }) upiId: string | null;
  @Column({ type: 'varchar', nullable: true }) qrCodeUrl: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: false }) isDefault: boolean;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}