import { Notification, NotificationStats, PaginatedNotifications, GetNotificationsQuery, BulkActionDto, NotificationType } from '../types';

const STORAGE_KEY = 'merigaumata_admin_notifications';

const INITIAL_MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'f1a9284d-e9c1-4b13-8d07-2856230f6b4e',
    type: 'order',
    status: 'unread',
    title: 'Test User placed an order of 487.50!',
    message: 'New order #9824 received. Items: 3x Organic Ghee, 1x Sacred Puja Incense.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    metadata: {
      amount: 487.50,
      customerName: 'Test User',
      customerAvatar: 'https://i.pravatar.cc/100?img=11',
      orderId: '9824',
    }
  },
  {
    id: 'b2d8e412-a1f9-4d6c-82e4-9844e1bc2a4d',
    type: 'order',
    status: 'unread',
    title: 'Test User placed an order of 4782.50!',
    message: 'New order #9823 received. Special requirements: Fast shipping to terminal depot.',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    metadata: {
      amount: 4782.50,
      customerName: 'Test User',
      customerAvatar: 'https://i.pravatar.cc/100?img=11',
      orderId: '9823',
    }
  },
  {
    id: 'c3e98124-b20d-452f-a3d8-e1bc24d98a5e',
    type: 'order',
    status: 'unread',
    title: 'Ruslan test Qwer User placed an order of 813.15!',
    message: 'New order #9822 received. Payment processed via Stripe.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    metadata: {
      amount: 813.15,
      customerName: 'Ruslan test Qwer User',
      customerAvatar: 'https://i.pravatar.cc/100?img=12',
      orderId: '9822',
    }
  },
  {
    id: 'd4f9e1bc-c30e-42bf-b4a8-f2cd35d8e74b',
    type: 'order',
    status: 'unread',
    title: 'Test User placed an order of 344.57!',
    message: 'New order #9821 received. Items: 10x Vedic Agnihotra Cups.',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
    metadata: {
      amount: 344.57,
      customerName: 'Test User',
      customerAvatar: 'https://i.pravatar.cc/100?img=11',
      orderId: '9821',
    }
  },
  {
    id: 'e5a1bc24-d40e-43cf-a5a8-bc234d8e75ab',
    type: 'order',
    status: 'read',
    title: 'Test User placed an order of 270.67!',
    message: 'New order #9820 completed successfully. Dispatched immediately.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    metadata: {
      amount: 270.67,
      customerName: 'Test User',
      customerAvatar: 'https://i.pravatar.cc/100?img=11',
      orderId: '9820',
    }
  },
  {
    id: 'a6bc34de-e50e-44df-b6b9-cd345d8e76bc',
    type: 'system',
    status: 'read',
    title: 'System Update v1.2.5 deployed successfully',
    message: 'Core performance optimizations, CDN caching tweaks, and analytics load speeds improved by 40%.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    metadata: {
      version: 'v1.2.5',
    }
  },
  {
    id: 'fa82d491-92b1-4034-8c88-2947230b6c1f',
    type: 'order',
    status: 'read',
    title: 'Tanvir Ahmed placed an order of 604.28!',
    message: 'New order #9819 received.',
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(), // 8 days ago
    metadata: {
      amount: 604.28,
      customerName: 'Tanvir Ahmed',
      customerAvatar: 'https://i.pravatar.cc/100?img=14',
      orderId: '9819',
    }
  },
  {
    id: 'ba92d492-93c2-4145-8d99-3058231c7d2e',
    type: 'order',
    status: 'read',
    title: 'Test User placed an order of 50.78!',
    message: 'New order #9818 received.',
    createdAt: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(), // 13 days ago
    metadata: {
      amount: 50.78,
      customerName: 'Test User',
      customerAvatar: 'https://i.pravatar.cc/100?img=11',
      orderId: '9818',
    }
  },
  {
    id: 'ca02d493-94d3-4246-8ea9-4169232d8e3f',
    type: 'payment',
    status: 'unread',
    title: 'Payment failed for invoice #INV-9817',
    message: 'Stripe reported card declined (insufficient funds) for customer Cameron Williamson.',
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), // 14 days ago
    metadata: {
      amount: 1250.00,
      customerName: 'Cameron Williamson',
      customerAvatar: 'https://i.pravatar.cc/100?img=15',
      orderId: '9817',
    }
  },
  {
    id: 'da12d494-95e4-4347-8fb9-5270233e9f4a',
    type: 'order',
    status: 'read',
    title: 'Test User placed an order of 34485.68!',
    message: 'New wholesale order #9816 received.',
    createdAt: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(), // 16 days ago
    metadata: {
      amount: 34485.68,
      customerName: 'Test User',
      customerAvatar: 'https://i.pravatar.cc/100?img=11',
      orderId: '9816',
    }
  },
  {
    id: 'ea22d495-96f5-4448-8fc9-6381234f0f5b',
    type: 'order',
    status: 'read',
    title: 'Test User placed an order of 295.67!',
    message: 'New order #9815 received.',
    createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(), // 18 days ago
    metadata: {
      amount: 295.67,
      customerName: 'Test User',
      customerAvatar: 'https://i.pravatar.cc/100?img=11',
      orderId: '9815',
    }
  },
  {
    id: 'fa32d496-97a6-4549-8fd9-7492235f1f6c',
    type: 'delivery',
    status: 'read',
    title: 'Delivery of order #9810 completed',
    message: 'Sacred Cow Feed delivery finished by handler Wade Warren.',
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), // 20 days ago
    metadata: {
      customerName: 'Wade Warren',
      orderId: '9810',
    }
  },
  {
    id: 'fa42d497-98b7-4640-8fe9-8503236f2f7d',
    type: 'order',
    status: 'read',
    title: 'Tinotenda Makumbe placed an order of 435.16!',
    message: 'New order #9814 received.',
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(), // 25 days ago
    metadata: {
      amount: 435.16,
      customerName: 'Tinotenda Makumbe',
      customerAvatar: 'https://i.pravatar.cc/100?img=16',
      orderId: '9814',
    }
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockNotificationApi = {
  // Retrieve raw stored list
  _getRaw(): Notification[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_NOTIFICATIONS));
      return INITIAL_MOCK_NOTIFICATIONS;
    }
    return JSON.parse(data);
  },

  // Save raw stored list
  _saveRaw(notifications: Notification[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  },

  // Get statistics
  async getStats(): Promise<NotificationStats> {
    await delay(300);
    const all = this._getRaw();
    return {
      total: all.length,
      unread: all.filter((n) => n.status === 'unread').length,
      read: all.filter((n) => n.status === 'read').length,
      archived: all.filter((n) => n.status === 'archived').length,
    };
  },

  // Main paginated query
  async getNotifications(query: GetNotificationsQuery): Promise<PaginatedNotifications> {
    await delay(400);
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      type = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    let items = this._getRaw();

    // Filter by type
    if (type !== 'all') {
      items = items.filter((n) => n.type === type);
    }

    // Filter by status
    if (status !== 'all') {
      items = items.filter((n) => n.status === status);
    }

    // Filter by search search
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.message.toLowerCase().includes(s) ||
          (n.metadata?.customerName && n.metadata.customerName.toLowerCase().includes(s))
      );
    }

    // Sort items
    items.sort((a, b) => {
      let valA = a[sortBy as keyof Notification] || '';
      let valB = b[sortBy as keyof Notification] || '';
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'desc'
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      }
      return 0;
    });

    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    // Compute stats
    const rawAll = this._getRaw();
    const stats: NotificationStats = {
      total: rawAll.length,
      unread: rawAll.filter((n) => n.status === 'unread').length,
      read: rawAll.filter((n) => n.status === 'read').length,
      archived: rawAll.filter((n) => n.status === 'archived').length,
    };

    return {
      data: paginatedItems,
      meta: {
        page,
        limit,
        totalPages,
        totalCount,
      },
      stats,
    };
  },

  // Mark specific IDs as read
  async markAsRead(ids: string[]): Promise<NotificationStats> {
    await delay(300);
    const all = this._getRaw();
    const updated = all.map((n) => {
      if (ids.includes(n.id)) {
        return { ...n, status: 'read' as const };
      }
      return n;
    });
    this._saveRaw(updated);
    return this.getStats();
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<NotificationStats> {
    await delay(300);
    const all = this._getRaw();
    const updated = all.map((n) => ({ ...n, status: 'read' as const }));
    this._saveRaw(updated);
    return this.getStats();
  },

  // Delete specific notifications
  async deleteNotifications(ids: string[]): Promise<NotificationStats> {
    await delay(300);
    const all = this._getRaw();
    const filtered = all.filter((n) => !ids.includes(n.id));
    this._saveRaw(filtered);
    return this.getStats();
  },

  // Bulk operation executor
  async executeBulkAction(dto: BulkActionDto): Promise<NotificationStats> {
    await delay(400);
    const { ids, action } = dto;
    const all = this._getRaw();
    
    let updated: Notification[] = [];
    if (action === 'delete') {
      updated = all.filter((n) => !ids.includes(n.id));
    } else {
      const statusMap = {
        read: 'read' as const,
        unread: 'unread' as const,
        archive: 'archived' as const,
        delete: 'unread' as const, // unreachable fallback
      };
      const statusValue = statusMap[action];
      updated = all.map((n) => {
        if (ids.includes(n.id)) {
          return { ...n, status: statusValue };
        }
        return n;
      });
    }

    this._saveRaw(updated);
    return this.getStats();
  },

  // Live simulator stream trigger
  simulateServerPushNotification(): Notification {
    const names = ['Aarav Sharma', 'Priya Patel', 'Rahul Verma', 'Sneha Reddy', 'Aditya Iyer'];
    const avatars = [
      'https://i.pravatar.cc/100?img=21',
      'https://i.pravatar.cc/100?img=22',
      'https://i.pravatar.cc/100?img=23',
      'https://i.pravatar.cc/100?img=24',
      'https://i.pravatar.cc/100?img=25',
    ];
    const types: NotificationType[] = ['order', 'system', 'payment', 'delivery'];
    
    const randomIdx = Math.floor(Math.random() * names.length);
    const randomName = names[randomIdx];
    const randomAvatar = avatars[randomIdx];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const amount = parseFloat((50 + Math.random() * 5000).toFixed(2));
    
    let title = '';
    let message = '';
    
    if (randomType === 'order') {
      title = `${randomName} placed an order of ${amount}!`;
      message = `New transaction #98${orderId} created successfully. Dispatch pending.`;
    } else if (randomType === 'system') {
      title = `Cache rebuild triggered for order catalog`;
      message = `Indexing job completed in 1.45 seconds. Cache warming complete.`;
    } else if (randomType === 'payment') {
      title = `Invoice payment processed via Apple Pay`;
      message = `Payment of $${amount} finalized for Order #98${orderId}.`;
    } else {
      title = `Delivery handler dispatched for Order #98${orderId}`;
      message = `Driver assigned: ${randomName}. Estimated transit duration: 35 minutes.`;
    }

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: randomType,
      status: 'unread',
      title,
      message,
      createdAt: new Date().toISOString(),
      metadata: {
        amount,
        customerName: randomName,
        customerAvatar: randomAvatar,
        orderId: `98${orderId}`,
      }
    };

    const all = this._getRaw();
    const updated = [newNotification, ...all];
    this._saveRaw(updated);

    // Fire custom stream event to trigger live client hooks
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('merigaumata-notification-sse', {
        detail: newNotification,
      });
      window.dispatchEvent(event);
    }

    return newNotification;
  }
};
