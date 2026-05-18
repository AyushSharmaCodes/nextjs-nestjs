import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('galleries')
export class Gallery {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column() imageUrl: string;
  @Column({ nullable: true }) description: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}