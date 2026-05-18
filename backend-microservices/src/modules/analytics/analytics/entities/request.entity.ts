import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('request_logs')
export class RequestLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() method: string;
  @Column() path: string;
  @Column() statusCode: number;
  @Column({ default: 0 }) responseTime: number;
  @Column({ nullable: true }) userId: string;
  @CreateDateColumn() createdAt: Date;
}