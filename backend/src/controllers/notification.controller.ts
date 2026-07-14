import type { Request, Response } from 'express';
import { notificationRepository } from '@/repositories/notification.repository';
import type { NotificationType } from '@/repositories/notification.repository';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get all notifications with pagination
   */
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const {
        type,
        isRead,
        page = '1',
        limit = '20',
      } = req.query;

      const filters = {
        userId,
        ...(type && { type: type as NotificationType }),
        ...(typeof isRead === 'string' && { isRead: isRead === 'true' }),
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const result = await notificationRepository.getAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('[NOTIFICATION] getAll error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch notifications',
      });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notifications count
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await notificationRepository.getUnreadCount(userId);

      res.json({
        success: true,
        count,
      });
    } catch (error) {
      console.error('[NOTIFICATION] getUnreadCount error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get unread count',
      });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response) {
    const id = String(req.params.id);
    const userId = req.user!.userId;

    const notification = await notificationRepository.markAsRead(id, userId);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response) {
    const userId = req.user!.userId;
    const count = await notificationRepository.markAllAsRead(userId);

    res.json({
      success: true,
      count,
      message: `${count} notifications marked as read`,
    });
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteOne(req: Request, res: Response) {
    const id = String(req.params.id);
    const userId = req.user!.userId;

    await notificationRepository.delete(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  }

  /**
   * DELETE /api/notifications/read
   * Delete all read notifications
   */
  async deleteAllRead(req: Request, res: Response) {
    const userId = req.user!.userId;
    const count = await notificationRepository.deleteAllRead(userId);

    res.json({
      success: true,
      count,
      message: `${count} read notifications deleted`,
    });
  }
}

export const notificationController = new NotificationController();
