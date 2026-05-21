import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'productId' }) productId: string;

  @Column({ name: 'userId' }) userId: string;

  @Column({ name: 'parentId', type: 'uuid', nullable: true }) parentId: string | null;

  @Column({ type: 'text' }) content: string;

  @Column({ name: 'isApproved', default: true }) isApproved: boolean;

  @Column({ name: 'isHidden', default: false }) isHidden: boolean;

  @Column({ default: 0 }) depth: number;

  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}