import { Injectable } from '@nestjs/common';
import { ManagerRepository } from './manager.repository';

export interface ManagerFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface ManagerPermissions {
  canManageProducts?: boolean;
  canManageOrders?: boolean;
  canManageCoupons?: boolean;
  canManageBlogs?: boolean;
  canManageFaqs?: boolean;
  canManageGallery?: boolean;
  canManageEvents?: boolean;
  canManageDonations?: boolean;
  canManageTestimonials?: boolean;
  canManagePolicies?: boolean;
  canManageAboutUs?: boolean;
  canManageUsers?: boolean;
  [key: string]: boolean | undefined;
}

@Injectable()
export class ManagerService {
  constructor(private readonly managerRepo: ManagerRepository) {}

  async getManagers(filters?: ManagerFilters) {
    return this.managerRepo.findWithFilters(filters);
  }

  async getManager(id: string) { return this.managerRepo.findById(id); }
  
  async getManagerByIdentityId(identityId: string) { return this.managerRepo.findByIdentityId(identityId); }

  async createManager(data: {
    identityId: string;
    name: string;
    phone?: string;
    role?: string;
    creatorId?: string;
  }) {
    return this.managerRepo.create(data);
  }

  async updateManager(id: string, data: Partial<{ name: string; phone: string; role: string }>) {
    return this.managerRepo.update(id, data);
  }

  async deleteManager(id: string) { return this.managerRepo.delete(id); }

  async activateManager(id: string) { return this.managerRepo.update(id, { isActive: true }); }

  async deactivateManager(id: string) { return this.managerRepo.update(id, { isActive: false }); }

  async getPermissions(managerId: string) { return this.managerRepo.getPermissions(managerId); }

  async updatePermissions(managerId: string, data: any) { return this.managerRepo.updatePermissions(managerId, data); }

  async hasPermission(identityId: string, permission: string): Promise<boolean> {
    const manager = await this.managerRepo.findByIdentityId(identityId);
    if (!manager) return false;
    if (!manager.isActive) return false;
    if (manager.role === 'admin') return true;
    const perms = await this.managerRepo.getPermissions(manager.id);
    const permKey = this.normalizePermissionKey(permission);
    return (perms as any)[permKey] === true;
  }

  async hasAnyPermission(identityId: string, permissions: string[]): Promise<boolean> {
    for (const perm of permissions) {
      if (await this.hasPermission(identityId, perm)) return true;
    }
    return false;
  }

  private normalizePermissionKey(permission: string): string {
    const permMap: Record<string, string> = {
      'products': 'canManageProducts',
      'orders': 'canManageOrders',
      'coupons': 'canManageCoupons',
      'blogs': 'canManageBlogs',
      'faqs': 'canManageFaqs',
      'gallery': 'canManageGallery',
      'events': 'canManageEvents',
      'donations': 'canManageDonations',
      'testimonials': 'canManageTestimonials',
      'policies': 'canManagePolicies',
      'about': 'canManageAboutUs',
      'managers': 'canManageManagers',
      'settings': 'canManageSettings',
      'emails': 'canManageEmails',
      'translations': 'canManageTranslations',
      'webhooks': 'canManageWebhooks',
      'social': 'canManageSocial',
      'jobs': 'canManageJobs',
      'returns': 'canManageReturns',
      'refunds': 'canManageRefunds',
      'admin': 'canManageAdmin',
      'system': 'canManageSystem',
      'analytics': 'canViewAnalytics',
      'logs': 'canViewLogs',
    };
    return permMap[permission.toLowerCase()] || permission;
  }
}