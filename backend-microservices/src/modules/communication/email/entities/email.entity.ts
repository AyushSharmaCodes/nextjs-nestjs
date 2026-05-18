import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'template_key', length: 100, unique: true }) templateKey: string;
  @Column({ length: 255 }) name: string;
  @Column({ length: 500 }) subject: string;
  @Column({ name: 'html_body', type: 'text' }) htmlBody: string;
  @Column({ name: 'text_body', type: 'text', nullable: true }) textBody: string | null;
  @Column({ type: 'jsonb', default: [] }) variables: any[];
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ default: 1 }) version: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('email_queue')
export class EmailQueue {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'to_email' }) toEmail: string;
  @Column({ name: 'to_name', type: 'varchar', nullable: true }) toName: string | null;
  @Column({ name: 'template_key', type: 'varchar', length: 100, nullable: true }) templateKey: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) subject: string | null;
  @Column({ name: 'html_body', type: 'text', nullable: true }) htmlBody: string | null;
  @Column({ name: 'text_body', type: 'text', nullable: true }) textBody: string | null;
  @Column({ name: 'template_data', type: 'jsonb', nullable: true }) templateData: any;
  @Column({ length: 20, default: 'ses' }) provider: string;
  @Column({ length: 20, default: 'PENDING' }) status: string;
  @Column({ name: 'attempts', default: 0 }) attempts: number;
  @Column({ name: 'error_message', type: 'text', nullable: true }) errorMessage: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true }) sentAt: Date | null;
}

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid', nullable: true }) userId: string | null;
  @Column({ length: 255 }) name: string;
  @Column({ length: 255 }) email: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) phone: string | null;
  @Column({ length: 100 }) subject: string;
  @Column({ type: 'text' }) message: string;
  @Column({ length: 20, default: 'NEW' }) status: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}