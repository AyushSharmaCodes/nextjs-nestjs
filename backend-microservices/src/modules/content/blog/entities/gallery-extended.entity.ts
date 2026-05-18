import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('gallery_folders')
export class GalleryFolder {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'varchar', nullable: true }) description: string | null;
  @Column({ name: 'cover_image', type: 'varchar', nullable: true }) coverImage: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ name: 'display_order', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('gallery_items')
export class GalleryItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'folder_id' }) folderId: string;
  @ManyToOne(() => GalleryFolder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'folder_id' })
  folder: GalleryFolder;
  @Column() title: string;
  @Column() imageUrl: string;
  @Column({ type: 'varchar', nullable: true }) description: string | null;
  @Column({ type: 'varchar', nullable: true }) tags: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ name: 'display_order', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('gallery_videos')
export class GalleryVideo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'folder_id', type: 'uuid', nullable: true }) folderId: string | null;
  @Column() title: string;
  @Column() videoUrl: string;
  @Column({ name: 'thumbnail_url', type: 'varchar', nullable: true }) thumbnailUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) description: string | null;
  @Column({ type: 'int', nullable: true }) duration: number | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ name: 'display_order', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}