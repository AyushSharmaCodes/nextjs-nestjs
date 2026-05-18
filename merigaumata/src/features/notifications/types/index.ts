export type NotificationType = 'order' | 'system' | 'payment' | 'delivery';
export type NotificationStatus = 'read' | 'unread' | 'archived';

export interface NotificationMetadata {
  amount?: number;
  customerName?: string;
  customerAvatar?: string;
  orderId?: string;
  version?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  createdAt: string;
  metadata: NotificationMetadata;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: NotificationStatus | 'all';
  type?: NotificationType | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: PaginationMeta;
  stats: NotificationStats;
}

export interface BulkActionDto {
  ids: string[];
  action: 'read' | 'unread' | 'delete' | 'archive';
}
