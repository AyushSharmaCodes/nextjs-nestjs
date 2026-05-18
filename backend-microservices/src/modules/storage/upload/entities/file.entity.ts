import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('files')
export class FileRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() originalName: string;
  @Column() filename: string;
  @Column() mimetype: string;
  @Column() size: number;
  @Column() url: string;
  @Column({ nullable: true }) userId: string;
  @CreateDateColumn() createdAt: Date;
}