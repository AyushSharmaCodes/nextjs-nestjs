import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column() slug: string;
  @Column({ type: 'text' }) description: string;
  @Column() startDate: Date;
  @Column() endDate: Date;
  @Column({ nullable: true }) location: string;
  @Column({ nullable: true }) imageUrl: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: false }) isFeatured: boolean;
  @Column({ default: 0 }) maxParticipants: number;
  @Column({ default: 0 }) registeredCount: number;
  @Column({ default: 0 }) ticketPrice: number;
  @CreateDateColumn() createdAt: Date;
}