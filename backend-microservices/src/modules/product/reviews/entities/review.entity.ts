import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'product_id' }) productId: string;

  @Column({ name: 'user_id' }) userId: string;

  @Column() rating: number;

  @Column({ type: 'text', nullable: true }) title: string | null;

  @Column({ type: 'text', nullable: true }) comment: string | null;

  @Column({ name: 'is_verified_purchase', default: false }) isVerifiedPurchase: boolean;

  @Column({ name: 'is_approved', default: true }) isApproved: boolean;

  @Column({ name: 'helpful_count', default: 0 }) helpfulCount: number;

  @Column({ name: 'not_helpful_count', default: 0 }) notHelpfulCount: number;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}