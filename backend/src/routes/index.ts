import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { checkSubscription } from '@/middleware';
import asyncHandler from '@/middleware/asyncHandler';
import { getPublicPlans } from '@/controllers/billing.controller';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import teacherRoutes from './teacher.routes';
import groupRoutes from './group.routes';
import attendanceRoutes from './attendance.routes';
import paymentRoutes from './payment.routes';
import dashboardRoutes from './dashboard.routes';
import reportsRoutes from './reports.routes';
import settingsRoutes from './settings.routes';
import profileRoutes from './profile.routes';
import auditLogRoutes from './auditLog.routes';
import notificationRoutes from './notification.routes';
import calendarRoutes from './calendar.routes';
import smartNotificationRoutes from './smartNotification.routes';
import superAdminRoutes from './superAdmin.routes';
import importRoutes from './import.routes';
import exportRoutes from './export.routes';
import billingRoutes from './billing.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Public: used by the marketing pricing page — must come before the
// authenticated '/billing' mount below, which would otherwise shadow it.
router.get('/billing/plans', asyncHandler(getPublicPlans));

// Protected routes with authentication + subscription check
router.use('/students', authenticate, checkSubscription, studentRoutes);
router.use('/teachers', authenticate, checkSubscription, teacherRoutes);
router.use('/groups', authenticate, checkSubscription, groupRoutes);
router.use('/attendances', authenticate, checkSubscription, attendanceRoutes);
router.use('/payments', authenticate, checkSubscription, paymentRoutes);
router.use('/dashboard', authenticate, checkSubscription, dashboardRoutes);
router.use('/reports', authenticate, checkSubscription, reportsRoutes);
router.use('/settings', authenticate, checkSubscription, settingsRoutes);
router.use('/profile', authenticate, checkSubscription, profileRoutes);
router.use('/audit-logs', authenticate, checkSubscription, auditLogRoutes);
router.use('/notifications', authenticate, checkSubscription, notificationRoutes);
router.use('/calendar', authenticate, checkSubscription, calendarRoutes);
router.use('/smart-notifications', authenticate, checkSubscription, smartNotificationRoutes);

// Import/Export routes
router.use('/import', authenticate, checkSubscription, importRoutes);
router.use('/export', authenticate, checkSubscription, exportRoutes);

// Super Admin routes (authentication required, no subscription check)
router.use('/super-admin', authenticate, superAdminRoutes);

// Billing routes (authentication required, no subscription check — used to pay/restore subscription)
router.use('/billing', authenticate, billingRoutes);

export default router;
