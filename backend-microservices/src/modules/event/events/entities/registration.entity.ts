import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() eventId: string;
  @Column() userId: string;
  @Column() userName: string;
  @Column() userEmail: string;
  @Column({ nullable: true }) userPhone: string;
  @Column({ default: 'CONFIRMED' }) status: string;
  @Column({ default: 1 }) tickets: number;
  @Column({ default: 0 }) totalAmount: number;
  @CreateDateColumn() createdAt: Date;
}