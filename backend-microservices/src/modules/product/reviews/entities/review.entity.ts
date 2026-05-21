import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'productId' }) productId: string;

  @Column({ name: 'userId' }) userId: string;

  @Column() rating: number;

  @Column({ type: 'text', nullable: true }) title: string | null;

  @Column({ type: 'text', nullable: true }) comment: string | null;

  @Column({ name: 'isVerifiedPurchase', default: false }) isVerifiedPurchase: boolean;

  @Column({ name: 'isApproved', default: true }) isApproved: boolean;

  @Column({ name: 'helpfulCount', default: 0 }) helpfulCount: number;

  @Column({ name: 'notHelpfulCount', default: 0 }) notHelpfulCount: number;

  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}