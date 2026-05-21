import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contact_info')
export class ContactInfo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() key: string;
  @Column() value: string;
  @Column({ type: 'varchar', nullable: true }) label: string | null;
  @Column({ default: 'general' }) category: string;
  @Column({ default: true }) isPublic: boolean;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}