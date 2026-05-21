import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('gallery_folders')
export class GalleryFolder {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'varchar', nullable: true }) description: string | null;
  @Column({ name: 'coverImage', type: 'varchar', nullable: true }) coverImage: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('gallery_items')
export class GalleryItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'folderId' }) folderId: string;
  @ManyToOne(() => GalleryFolder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'folderId' })
  folder: GalleryFolder;
  @Column() title: string;
  @Column() imageUrl: string;
  @Column({ type: 'varchar', nullable: true }) description: string | null;
  @Column({ type: 'varchar', nullable: true }) tags: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}

@Entity('gallery_videos')
export class GalleryVideo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'folderId', type: 'uuid', nullable: true }) folderId: string | null;
  @Column() title: string;
  @Column() videoUrl: string;
  @Column({ name: 'thumbnailUrl', type: 'varchar', nullable: true }) thumbnailUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) description: string | null;
  @Column({ type: 'int', nullable: true }) duration: number | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}