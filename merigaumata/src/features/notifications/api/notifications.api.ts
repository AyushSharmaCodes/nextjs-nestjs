import { apiInstance } from '@/shared/lib/api/axios';
import { mockNotificationApi } from '../services/mockNotificationApi';
import { GetNotificationsQuery, PaginatedNotifications, NotificationStats, BulkActionDto } from '../types';

// Toggle to switch between persistent mock and actual NestJS back-end API
const USE_MOCK = true;

export const notificationsApi = {
  async getNotifications(query: GetNotificationsQuery): Promise<PaginatedNotifications> {
    if (USE_MOCK) {
      return mockNotificationApi.getNotifications(query);
    }
    const response = await apiInstance.get<PaginatedNotifications>('/notifications', { params: query });
    return response.data;
  },

  async markAsRead(ids: string[]): Promise<NotificationStats> {
    if (USE_MOCK) {
      return mockNotificationApi.markAsRead(ids);
    }
    const response = await apiInstance.patch<NotificationStats>('/notifications/read', { ids });
    return response.data;
  },

  async markAllAsRead(): Promise<NotificationStats> {
    if (USE_MOCK) {
      return mockNotificationApi.markAllAsRead();
    }
    const response = await apiInstance.patch<NotificationStats>('/notifications/read/all');
    return response.data;
  },

  async deleteNotifications(ids: string[]): Promise<NotificationStats> {
    if (USE_MOCK) {
      return mockNotificationApi.deleteNotifications(ids);
    }
    const response = await apiInstance.delete<NotificationStats>('/notifications', { data: { ids } });
    return response.data;
  },

  async executeBulkAction(dto: BulkActionDto): Promise<NotificationStats> {
    if (USE_MOCK) {
      return mockNotificationApi.executeBulkAction(dto);
    }
    const response = await apiInstance.post<NotificationStats>('/notifications/bulk', dto);
    return response.data;
  }
};
