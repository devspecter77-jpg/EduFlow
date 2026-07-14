import type { Request, Response } from 'express';
import { auditLogRepository, type AuditLogFilters } from '@repositories/auditLog.repository';
import { sendSuccess, sendError } from '@utils/response';
import { $Enums } from '@prisma/client';

export class AuditLogController {
  /**
   * GET /api/audit-logs
   */
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const filters: AuditLogFilters = { userId };

      if (req.query.action) {
        filters.action = req.query.action as $Enums.AuditAction;
      }
      if (req.query.entity) {
        filters.entity = req.query.entity as string;
      }
      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }
      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      const { data, total } = await auditLogRepository.findMany(filters, page, limit);

      res.json({
        success: true,
        data,
        message: 'Audit loglar yuklandi',
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      sendError(res, 'Audit loglarni yuklashda xatolik', 500);
    }
  }

  /**
   * GET /api/audit-logs/recent
   */
  async getRecentLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = Number(req.query.limit) || 10;
      const logs = await auditLogRepository.findRecent(userId, limit);
      sendSuccess(res, logs, 'Oxirgi loglar yuklandi');
    } catch (error) {
      console.error('Get recent logs error:', error);
      sendError(res, 'Oxirgi loglarni yuklashda xatolik', 500);
    }
  }

  /**
   * DELETE /api/audit-logs/cleanup  (Admin only — scoped to the caller's own tenant)
   */
  async cleanupLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const days = Number(req.query.days) || 90;
      const deletedCount = await auditLogRepository.deleteOlderThan(userId, days);
      sendSuccess(res, { deletedCount }, `${days} kundan eski ${deletedCount} log o'chirildi`);
    } catch (error) {
      console.error('Cleanup logs error:', error);
      sendError(res, 'Loglarni tozalashda xatolik', 500);
    }
  }
}

export const auditLogController = new AuditLogController();
