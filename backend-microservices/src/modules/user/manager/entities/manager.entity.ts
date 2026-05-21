import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identityId', unique: true })
  identityId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ length: 20, default: 'manager' })
  role: string;

  @Column({ name: 'creatorId', type: 'uuid', nullable: true })
  creatorId: string | null;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

@Entity('manager_permissions')
export class ManagerPermissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'managerId' })
  managerId: string;

  @OneToOne(() => Manager, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'managerId' })
  manager: Manager;

  @Column({ name: 'canManageProducts', default: false })
  canManageProducts: boolean;
  @Column({ name: 'canManageOrders', default: false })
  canManageOrders: boolean;
  @Column({ name: 'canManageCoupons', default: false })
  canManageCoupons: boolean;
  @Column({ name: 'canManageBlogs', default: false })
  canManageBlogs: boolean;
  @Column({ name: 'canManageFaqs', default: false })
  canManageFaqs: boolean;
  @Column({ name: 'canManageGallery', default: false })
  canManageGallery: boolean;
  @Column({ name: 'canManageEvents', default: false })
  canManageEvents: boolean;
  @Column({ name: 'canManageDonations', default: false })
  canManageDonations: boolean;
  @Column({ name: 'canManageTestimonials', default: false })
  canManageTestimonials: boolean;
  @Column({ name: 'canManagePolicies', default: false })
  canManagePolicies: boolean;
  @Column({ name: 'canManageAboutUs', default: false })
  canManageAboutUs: boolean;
  @Column({ name: 'canManageManagers', default: false })
  canManageManagers: boolean;
  @Column({ name: 'canManageSettings', default: false })
  canManageSettings: boolean;
  @Column({ name: 'canManageEmails', default: false })
  canManageEmails: boolean;
  @Column({ name: 'canManageTranslations', default: false })
  canManageTranslations: boolean;
  @Column({ name: 'canManageWebhooks', default: false })
  canManageWebhooks: boolean;
  @Column({ name: 'canManageSocial', default: false })
  canManageSocial: boolean;
  @Column({ name: 'canManageJobs', default: false })
  canManageJobs: boolean;
  @Column({ name: 'canManageReturns', default: false })
  canManageReturns: boolean;
  @Column({ name: 'canManageRefunds', default: false })
  canManageRefunds: boolean;
  @Column({ name: 'canManageAdmin', default: false })
  canManageAdmin: boolean;
  @Column({ name: 'canManageSystem', default: false })
  canManageSystem: boolean;
  @Column({ name: 'canViewAnalytics', default: false })
  canViewAnalytics: boolean;
  @Column({ name: 'canViewLogs', default: false })
  canViewLogs: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}