import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'product_id' }) productId: string;

  @Column({ name: 'user_id' }) userId: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true }) parentId: string | null;

  @Column({ type: 'text' }) content: string;

  @Column({ name: 'is_approved', default: true }) isApproved: boolean;

  @Column({ name: 'is_hidden', default: false }) isHidden: boolean;

  @Column({ default: 0 }) depth: number;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}