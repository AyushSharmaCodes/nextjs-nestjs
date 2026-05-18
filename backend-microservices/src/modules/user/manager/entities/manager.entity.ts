import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identity_id', unique: true })
  identityId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ length: 20, default: 'manager' })
  role: string;

  @Column({ name: 'creator_id', type: 'uuid', nullable: true })
  creatorId: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('manager_permissions')
export class ManagerPermissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'manager_id' })
  managerId: string;

  @OneToOne(() => Manager, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'manager_id' })
  manager: Manager;

  @Column({ name: 'can_manage_products', default: false })
  canManageProducts: boolean;
  @Column({ name: 'can_manage_orders', default: false })
  canManageOrders: boolean;
  @Column({ name: 'can_manage_coupons', default: false })
  canManageCoupons: boolean;
  @Column({ name: 'can_manage_blogs', default: false })
  canManageBlogs: boolean;
  @Column({ name: 'can_manage_faqs', default: false })
  canManageFaqs: boolean;
  @Column({ name: 'can_manage_gallery', default: false })
  canManageGallery: boolean;
  @Column({ name: 'can_manage_events', default: false })
  canManageEvents: boolean;
  @Column({ name: 'can_manage_donations', default: false })
  canManageDonations: boolean;
  @Column({ name: 'can_manage_testimonials', default: false })
  canManageTestimonials: boolean;
  @Column({ name: 'can_manage_policies', default: false })
  canManagePolicies: boolean;
  @Column({ name: 'can_manage_about_us', default: false })
  canManageAboutUs: boolean;
  @Column({ name: 'can_manage_managers', default: false })
  canManageManagers: boolean;
  @Column({ name: 'can_manage_settings', default: false })
  canManageSettings: boolean;
  @Column({ name: 'can_manage_emails', default: false })
  canManageEmails: boolean;
  @Column({ name: 'can_manage_translations', default: false })
  canManageTranslations: boolean;
  @Column({ name: 'can_manage_webhooks', default: false })
  canManageWebhooks: boolean;
  @Column({ name: 'can_manage_social', default: false })
  canManageSocial: boolean;
  @Column({ name: 'can_manage_jobs', default: false })
  canManageJobs: boolean;
  @Column({ name: 'can_manage_returns', default: false })
  canManageReturns: boolean;
  @Column({ name: 'can_manage_refunds', default: false })
  canManageRefunds: boolean;
  @Column({ name: 'can_manage_admin', default: false })
  canManageAdmin: boolean;
  @Column({ name: 'can_manage_system', default: false })
  canManageSystem: boolean;
  @Column({ name: 'can_view_analytics', default: false })
  canViewAnalytics: boolean;
  @Column({ name: 'can_view_logs', default: false })
  canViewLogs: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}