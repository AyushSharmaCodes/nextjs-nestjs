import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

interface TemplateVariables {
  [key: string]: string | number | boolean | null;
}

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'templateKey', length: 100, unique: true }) templateKey: string;
  @Column({ length: 255 }) name: string;
  @Column({ length: 500 }) subject: string;
  @Column({ name: 'subjectI18nKey', type: 'varchar', length: 200, nullable: true }) subjectI18nKey: string | null;
  @Column({ name: 'htmlBody', type: 'text' }) htmlBody: string;
  @Column({ name: 'textBody', type: 'text', nullable: true }) textBody: string | null;
  @Column({ type: 'jsonb', default: [] }) variables: TemplateVariables[];
  @Column({ name: 'isActive', default: true }) isActive: boolean;
  @Column({ default: 1 }) version: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('email_queue')
export class EmailQueue {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'toEmail' }) toEmail: string;
  @Column({ name: 'toName', type: 'varchar', nullable: true }) toName: string | null;
  @Column({ name: 'templateKey', type: 'varchar', length: 100, nullable: true }) templateKey: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) subject: string | null;
  @Column({ name: 'htmlBody', type: 'text', nullable: true }) htmlBody: string | null;
  @Column({ name: 'textBody', type: 'text', nullable: true }) textBody: string | null;
  @Column({ name: 'templateData', type: 'jsonb', nullable: true }) templateData: TemplateVariables;
  @Column({ length: 20, default: 'ses' }) provider: string;
  @Column({ length: 20, default: 'PENDING' }) status: string;
  @Column({ name: 'attempts', default: 0 }) attempts: number;
  @Column({ name: 'errorMessage', type: 'text', nullable: true }) errorMessage: string | null;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @Column({ name: 'sentAt', type: 'timestamptz', nullable: true }) sentAt: Date | null;
}

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'userId', type: 'uuid', nullable: true }) userId: string | null;
  @Column({ length: 255 }) name: string;
  @Column({ length: 255 }) email: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) phone: string | null;
  @Column({ length: 100 }) subject: string;
  @Column({ type: 'text' }) message: string;
  @Column({ length: 20, default: 'NEW' }) status: string;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}