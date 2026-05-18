import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bank_details')
export class BankDetail {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() bankName: string;
  @Column({ name: 'account_number' }) accountNumber: string;
  @Column({ name: 'ifsc_code', length: 20 }) ifscCode: string;
  @Column({ name: 'branch_name', type: 'varchar', nullable: true }) branchName: string | null;
  @Column({ default: 'current' }) accountType: string;
  @Column({ type: 'varchar', nullable: true }) upiId: string | null;
  @Column({ type: 'varchar', nullable: true }) qrCodeUrl: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: false }) isDefault: boolean;
  @Column({ name: 'display_order', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}