import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSettings, SystemSwitch, AdminAlert, AdminNotification } from './entities/settings.entity';

@Injectable()
export class SettingsRepository {
  constructor(
    @InjectRepository(StoreSettings) private settingsRepo: Repository<StoreSettings>,
    @InjectRepository(SystemSwitch) private switchesRepo: Repository<SystemSwitch>,
    @InjectRepository(AdminAlert) private alertsRepo: Repository<AdminAlert>,
    @InjectRepository(AdminNotification) private notifsRepo: Repository<AdminNotification>,
  ) {}

  async getPublicSettings() { return this.settingsRepo.find({ where: { isPublic: true } }); }
  async getAllSettings() { return this.settingsRepo.find(); }
  async getSetting(key: string) { return this.settingsRepo.findOne({ where: { key } }); }
  async getSettingsByCategory(category: string) { return this.settingsRepo.find({ where: { category } }); }
  async setSetting(key: string, value: any, category?: string, isPublic = false, updatedBy?: string) {
    let setting = await this.getSetting(key);
    if (setting) { await this.settingsRepo.update(setting.id, { value, category: category || setting.category, updatedBy }); }
    else { setting = this.settingsRepo.create({ key, value, category, isPublic, updatedBy }); await this.settingsRepo.save(setting); }
    return this.getSetting(key);
  }

  async getSwitches() { return this.switchesRepo.find(); }
  async getSwitch(key: string) { return this.switchesRepo.findOne({ where: { switchKey: key } }); }
  async setSwitch(key: string, isEnabled: boolean) {
    let sw = await this.getSwitch(key);
    if (sw) { await this.switchesRepo.update(sw.id, { isEnabled }); }
    else { sw = this.switchesRepo.create({ switchKey: key, isEnabled }); await this.switchesRepo.save(sw); }
    return this.getSwitch(key);
  }

  async getAlerts(isRead?: boolean) { return this.alertsRepo.find({ where: isRead !== undefined ? { isRead } : undefined, order: { createdAt: 'DESC' } }); }
  async markAlertRead(id: string, userId: string) { await this.alertsRepo.update(id, { isRead: true, readBy: userId, readAt: new Date() }); }
  async markAllAlertsRead(userId: string) { await this.alertsRepo.update({ isRead: false }, { isRead: true, readBy: userId, readAt: new Date() }); }

  async getNotifications(userId: string) { return this.notifsRepo.find({ where: { userId, isArchived: false }, order: { createdAt: 'DESC' } }); }
  async getUnreadCount(userId: string) { return this.notifsRepo.count({ where: { userId, isRead: false, isArchived: false } }); }
  async markNotificationRead(id: string) { await this.notifsRepo.update(id, { isRead: true, readAt: new Date() }); }
  async archiveNotification(id: string) { await this.notifsRepo.update(id, { isArchived: true }); }
}