import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('translations')
export class Translation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() namespace: string;
  @Column() key: string;
  @Column() language: string;
  @Column({ type: 'text' }) value: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('translation_metadata')
export class TranslationMetadata {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) language: string;
  @Column() name: string;
  @Column({ default: false }) isDefault: boolean;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}