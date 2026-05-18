import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ nullable: true }) eventId: string;
  @Column() amount: number;
  @Column({ default: 'INR' }) currency: string;
  @Column({ default: 'one_time' }) type: string;
  @Column({ nullable: true }) paymentId: string;
  @Column({ default: 'PENDING' }) status: string;
  @Column({ nullable: true }) message: string;
  @CreateDateColumn() createdAt: Date;
}