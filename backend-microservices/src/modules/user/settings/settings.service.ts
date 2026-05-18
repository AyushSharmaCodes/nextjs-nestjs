import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';

@Injectable()
export class SettingsService {
  constructor(private readonly repo: SettingsRepository) {}

  async getPublicSettings() { return this.repo.getPublicSettings(); }
  async getAllSettings() { return this.repo.getAllSettings(); }
  async getSetting(key: string) { return this.repo.getSetting(key); }
  async updateSetting(key: string, value: any, category?: string) { return this.repo.setSetting(key, value, category); }
  async getSettingsByCategory(category: string) { return this.repo.getSettingsByCategory(category); }

  async getSwitches() { return this.repo.getSwitches(); }
  async updateSwitch(key: string, isEnabled: boolean) { return this.repo.setSwitch(key, isEnabled); }

  async getAlerts(isRead?: boolean) { return this.repo.getAlerts(isRead); }
  async markAlertRead(id: string, userId: string) { return this.repo.markAlertRead(id, userId); }
  async markAllAlertsRead(userId: string) { return this.repo.markAllAlertsRead(userId); }

  async getNotifications(userId: string) { return this.repo.getNotifications(userId); }
  async getUnreadCount(userId: string) { return this.repo.getUnreadCount(userId); }
  async markNotificationRead(id: string) { return this.repo.markNotificationRead(id); }
  async archiveNotification(id: string) { return this.repo.archiveNotification(id); }
}