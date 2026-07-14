import { Router } from 'express';
import { auditLogController } from '@controllers/auditLog.controller';
import { authenticate, authorize } from '@middleware/auth.middleware';
import asyncHandler from '@middleware/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/audit-logs - Get audit logs
router.get('/', asyncHandler((req, res) => auditLogController.getLogs(req, res)));

// GET /api/audit-logs/recent - Get recent logs
router.get('/recent', asyncHandler((req, res) => auditLogController.getRecentLogs(req, res)));

// DELETE /api/audit-logs/cleanup - Cleanup old logs (Admin only)
router.delete('/cleanup', authorize('ADMIN'), asyncHandler((req, res) => auditLogController.cleanupLogs(req, res)));

export default router;
