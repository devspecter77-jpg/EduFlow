import { apiClient } from './client';

export type NotificationType =
  | 'NEW_STUDENT'
  | 'NEW_GROUP'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'CLASS_TODAY'
  | 'ATTENDANCE_MISSING'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export const notificationsApi = {
  /**
   * Get all notifications
   */
  async getAll(filters?: NotificationFilters): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (typeof filters?.isRead === 'boolean')
      params.append('isRead', String(filters.isRead));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await apiClient.get<NotificationResponse>(
      `/notifications?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>(
      '/notifications/unread-count'
    );
    return response.data.count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    await apiClient.delete('/notifications/read/all');
  },
};
