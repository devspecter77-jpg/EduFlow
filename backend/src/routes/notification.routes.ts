import { Router } from 'express';
import { notificationController } from '@/controllers/notification.controller';
import { asyncHandler } from '@/middleware';

const router = Router();

// Get all notifications with pagination
router.get('/', asyncHandler((req, res) => notificationController.getAll(req, res)));

// Get unread count
router.get('/unread-count', asyncHandler((req, res) => notificationController.getUnreadCount(req, res)));

// Mark all as read (must be BEFORE /:id route)
router.patch('/read-all', asyncHandler((req, res) => notificationController.markAllAsRead(req, res)));

// Delete all read (must be BEFORE /:id route)
router.delete('/read/all', asyncHandler((req, res) => notificationController.deleteAllRead(req, res)));

// Mark single notification as read
router.patch('/:id/read', asyncHandler((req, res) => notificationController.markAsRead(req, res)));

// Delete single notification
router.delete('/:id', asyncHandler((req, res) => notificationController.deleteOne(req, res)));

export default router;
