import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) slug: string;
  @Column() title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ type: 'varchar', nullable: true }) metaTitle: string | null;
  @Column({ type: 'text', nullable: true }) metaDescription: string | null;
  @Column({ default: 'draft' }) status: string;
  @Column({ default: false }) isPublished: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) slug: string;
  @Column() title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ default: 'privacy' }) type: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ type: 'varchar', nullable: true }) version: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'varchar', nullable: true }) imageUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) designation: string | null;
  @Column({ type: 'text' }) content: string;
  @Column({ default: 5 }) rating: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('social_media')
export class SocialMedia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() platform: string;
  @Column() url: string;
  @Column({ type: 'varchar', nullable: true }) icon: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}