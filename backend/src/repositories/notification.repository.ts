import { prisma } from '@/config/database';

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
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationFilters {
  userId: string;
  type?: NotificationType;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export class NotificationRepository {
  async create(data: CreateNotificationInput): Promise<Notification> {
    return db.notification.create({ data });
  }

  async getAll(filters: NotificationFilters) {
    const { userId, type, isRead, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId,
      ...(type && { type }),
      ...(typeof isRead === 'boolean' && { isRead }),
    };

    const [data, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
    ]);

    return {
      data: data as Notification[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({ where: { userId, isRead: false } });
  }

  async getById(id: string, userId: string): Promise<Notification | null> {
    return db.notification.findFirst({ where: { id, userId } });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    // verify ownership
    const n = await this.getById(id, userId);
    if (!n) throw new Error('Notification not found');
    return db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async delete(id: string, userId: string): Promise<Notification> {
    const n = await this.getById(id, userId);
    if (!n) throw new Error('Notification not found');
    return db.notification.delete({ where: { id } });
  }

  async deleteAllRead(userId: string): Promise<number> {
    const result = await db.notification.deleteMany({
      where: { userId, isRead: true },
    });
    return result.count;
  }
}

export const notificationRepository = new NotificationRepository();
