import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column() slug: string;
  @Column({ type: 'text' }) content: string;
  @Column({ nullable: true }) imageUrl: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: false }) isFeatured: boolean;
  @CreateDateColumn() createdAt: Date;
}